const Contract = require('../models/Contract');
const Customer = require('../models/Customer');
const Meter = require('../models/Meter');
const MeterReading = require('../models/MeterReading');
const PackageUpgradeRequest = require('../models/PackageUpgradeRequest');
const Todo = require('../models/Todo');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const beraterId = req.user._id;

    // Auslaufende Verträge (nächste 90 Tage)
    const today = new Date();
    const in90Days = new Date();
    in90Days.setDate(today.getDate() + 90);

    const expiringContracts = await Contract.find({
      beraterId,
      status: 'active',
      endDate: { $gte: today, $lte: in90Days }
    })
      .populate('customerId', 'firstName lastName customerNumber')
      .populate('supplierId', 'name shortName')
      .sort({ endDate: 1 })
      .limit(10);

    // Verträge nach Anbieter
    const contractsBySupplier = await Contract.aggregate([
      { $match: { beraterId, status: 'active' } },
      { $group: { _id: '$supplierId', count: { $sum: 1 } } },
      { $lookup: {
        from: 'suppliers',
        localField: '_id',
        foreignField: '_id',
        as: 'supplier'
      }},
      { $unwind: '$supplier' },
      { $project: {
        _id: 1,
        name: '$supplier.name',
        shortName: '$supplier.shortName',
        count: 1
      }},
      { $sort: { count: -1 } }
    ]);

    // Kundenstatus
    const activeCustomers = await Customer.countDocuments({
      beraterId,
      isActive: true
    });

    const customersWithExpiringContracts = await Contract.distinct('customerId', {
      beraterId,
      status: 'active',
      endDate: { $gte: today, $lte: in90Days }
    });

    // Zählerstatus
    const totalMeters = await Meter.countDocuments({ beraterId });
    const freeMeters = await Meter.countDocuments({
      beraterId,
      currentCustomerId: null
    });
    const occupiedMeters = totalMeters - freeMeters;

    // Offene TODOs (nicht Support-Tickets)
    const openTodos = await Todo.countDocuments({
      beraterId,
      status: { $in: ['open', 'in_progress'] },
      isSupportTicket: { $ne: true }
    });

    const urgentTodos = await Todo.countDocuments({
      beraterId,
      status: { $in: ['open', 'in_progress'] },
      isSupportTicket: { $ne: true },
      $or: [
        { priority: 'high' },
        { dueDate: { $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) } }
      ]
    });

    // Verträge Statistik (aktiv/gesamt)
    const contractStats = await Contract.aggregate([
      { $match: { beraterId } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
      }}
    ]);

    // Neue Kunden (letzter Monat)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const newCustomersCount = await Customer.countDocuments({
      beraterId,
      createdAt: { $gte: oneMonthAgo }
    });

    // Überfällige Verträge (Enddatum überschritten, aber noch aktiv)
    const overdueContracts = await Contract.find({
      beraterId,
      status: 'active',
      endDate: { $lt: today }
    })
      .populate('customerId', 'firstName lastName customerNumber')
      .populate('supplierId', 'name shortName')
      .sort({ endDate: 1 })
      .limit(20);

    const overdueContractsCount = await Contract.countDocuments({
      beraterId,
      status: 'active',
      endDate: { $lt: today }
    });

    // Verträge der letzten 30 Tage mit Zählerablesung-Statistik
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Verträge der letzten 30 Tage
    const recentContracts = await Contract.find({
      beraterId,
      createdAt: { $gte: thirtyDaysAgo }
    }).select('_id');

    const recentContractIds = recentContracts.map(c => c._id);
    const recentContractsCount = recentContractIds.length;

    // Davon: Verträge mit mindestens einer Zählerablesung
    let contractsWithReadings = 0;
    if (recentContractsCount > 0) {
      const contractsWithReadingsResult = await MeterReading.distinct('contractId', {
        beraterId,
        contractId: { $in: recentContractIds }
      });
      contractsWithReadings = contractsWithReadingsResult.length;
    }

    const contractsWithoutReadings = recentContractsCount - contractsWithReadings;

    // Upgrade-Anfragen (nur für Superadmin)
    let upgradeRequests = null;
    if (req.user.role === 'superadmin') {
      // Pending und Payment Received Anfragen (warten auf Review)
      const pendingUpgrades = await PackageUpgradeRequest.find({
        status: { $in: ['pending', 'payment_received'] }
      })
        .populate('user', 'email firstName lastName package')
        .populate('paymentMethod')
        .sort({ createdAt: -1 })
        .limit(10);

      const pendingCount = await PackageUpgradeRequest.countDocuments({
        status: 'pending'
      });

      const paymentReceivedCount = await PackageUpgradeRequest.countDocuments({
        status: 'payment_received'
      });

      upgradeRequests = {
        pending: pendingUpgrades,
        counts: {
          pending: pendingCount,
          paymentReceived: paymentReceivedCount,
          awaitingReview: pendingCount + paymentReceivedCount
        }
      };
    }

    const dashboardData = {
      expiringContracts,
      overdueContracts: {
        list: overdueContracts,
        count: overdueContractsCount
      },
      contractsBySupplier,
      customers: {
        active: activeCustomers,
        withExpiringContracts: customersWithExpiringContracts.length
      },
      meters: {
        total: totalMeters,
        free: freeMeters,
        occupied: occupiedMeters
      },
      reminders: {
        total: openTodos,
        urgent: urgentTodos,
        todosOnly: openTodos
      },
      contracts: {
        total: contractStats[0]?.total || 0,
        active: contractStats[0]?.active || 0
      },
      newCustomers: {
        count: newCustomersCount,
        period: 'lastMonth'
      },
      recentContractsReadings: {
        totalContracts: recentContractsCount,
        withReadings: contractsWithReadings,
        withoutReadings: contractsWithoutReadings
      }
    };

    // Nur für Superadmin: Upgrade-Anfragen hinzufügen
    if (upgradeRequests) {
      dashboardData.upgradeRequests = upgradeRequests;
    }

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard chart data (monthly trends)
// @route   GET /api/dashboard/charts
// @access  Private
exports.getDashboardCharts = async (req, res, next) => {
  try {
    const beraterId = req.user._id;
    const { months = 6 } = req.query;
    const monthsCount = Math.min(parseInt(months), 12);

    // Erstelle Array der letzten X Monate
    const monthsArray = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      monthsArray.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
      });
    }

    // Verträge pro Monat (nach Erstellungsdatum)
    const contractsByMonth = await Contract.aggregate([
      {
        $match: {
          beraterId,
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - monthsCount))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Kunden pro Monat (nach Erstellungsdatum)
    const customersByMonth = await Customer.aggregate([
      {
        $match: {
          beraterId,
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - monthsCount))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Zähler pro Monat (nach Erstellungsdatum)
    const metersByMonth = await Meter.aggregate([
      {
        $match: {
          beraterId,
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - monthsCount))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Mappe Daten auf Monate
    const mapDataToMonths = (data, monthsArr) => {
      return monthsArr.map(m => {
        const found = data.find(d => d._id.year === m.year && d._id.month === m.month);
        return found ? found.count : 0;
      });
    };

    const chartData = {
      labels: monthsArray.map(m => m.label),
      contracts: mapDataToMonths(contractsByMonth, monthsArray),
      customers: mapDataToMonths(customersByMonth, monthsArray),
      meters: mapDataToMonths(metersByMonth, monthsArray)
    };

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    next(error);
  }
};
