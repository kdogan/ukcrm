const Contract = require('../models/Contract');
const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');

// @desc    Get contract statistics by time period and status
// @route   GET /api/statistics/contracts
// @access  Private
exports.getContractStatistics = async (req, res, next) => {
  try {
    const beraterId = req.user._id;
    const { months = 6, supplierId } = req.query;
    const monthsCount = Math.min(Math.max(parseInt(months), 1), 24); // 1-24 Monate

    // Berechne Start-Datum basierend auf Monatsanzahl
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsCount);
    startDate.setDate(1); // Ersten Tag des Monats
    startDate.setHours(0, 0, 0, 0);

    // Basis-Match-Bedingung
    const baseMatch = { beraterId };
    if (supplierId && supplierId !== 'all') {
      baseMatch.supplierId = new mongoose.Types.ObjectId(supplierId);
    }

    // Aggregation: Verträge nach Monat und Status gruppieren
    const contractsByMonthAndStatus = await Contract.aggregate([
      {
        $match: {
          ...baseMatch,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.status': 1 }
      }
    ]);

    // Gesamt-Statistiken pro Status (unabhängig vom Zeitraum)
    const totalByStatus = await Contract.aggregate([
      {
        $match: baseMatch
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Statistiken im gewählten Zeitraum pro Status
    const periodByStatus = await Contract.aggregate([
      {
        $match: {
          ...baseMatch,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Verträge, die im ausgewählten Zeitraum enden (endDate im Zeitraum)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endPeriodDate = new Date();
    endPeriodDate.setMonth(endPeriodDate.getMonth() + monthsCount);
    endPeriodDate.setHours(23, 59, 59, 999);

    const endingContracts = await Contract.find({
      ...baseMatch,
      status: 'active',
      endDate: { $gte: today, $lte: endPeriodDate }
    })
      .populate('customerId', 'firstName lastName customerNumber')
      .populate('supplierId', 'name shortName')
      .sort({ endDate: 1 })
      .lean();

    const endingContractsCount = endingContracts.length;

    // Vertragsende-Prognose: Wie viele Verträge enden pro Monat in der Zukunft
    const futureMonthsArray = [];
    for (let i = 0; i < monthsCount; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      futureMonthsArray.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
      });
    }

    // Aggregation: Aktive Verträge nach Enddatum (Monat) gruppieren
    const contractsEndingByMonth = await Contract.aggregate([
      {
        $match: {
          ...baseMatch,
          status: 'active',
          endDate: { $gte: today, $lte: endPeriodDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$endDate' },
            month: { $month: '$endDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Erstelle Chart-Daten für Vertragsende-Prognose
    const endingContractsChartData = {
      labels: futureMonthsArray.map(m => m.label),
      data: futureMonthsArray.map(m => {
        const found = contractsEndingByMonth.find(
          d => d._id.year === m.year && d._id.month === m.month
        );
        return found ? found.count : 0;
      })
    };

    // Anbieter-Liste für Filter laden
    const suppliers = await Supplier.find({ beraterId })
      .select('_id name shortName')
      .sort({ name: 1 })
      .lean();

    // Erstelle Array der Monate für Labels
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

    // Status-Definitionen
    const statuses = ['draft', 'active', 'ended', 'archived'];
    const statusLabels = {
      draft: 'Entwurf',
      active: 'Belieferung',
      ended: 'Beendet',
      archived: 'Gekündigt'
    };

    // Mappe Daten auf Monate für jeden Status
    const chartData = {
      labels: monthsArray.map(m => m.label),
      datasets: statuses.map(status => ({
        status,
        label: statusLabels[status],
        data: monthsArray.map(m => {
          const found = contractsByMonthAndStatus.find(
            d => d._id.year === m.year && d._id.month === m.month && d._id.status === status
          );
          return found ? found.count : 0;
        })
      }))
    };

    // Gesamtzahlen formatieren
    const totalStats = {};
    statuses.forEach(status => {
      const found = totalByStatus.find(s => s._id === status);
      totalStats[status] = found ? found.count : 0;
    });
    totalStats.total = Object.values(totalStats).reduce((a, b) => a + b, 0);

    // Periodenzahlen formatieren
    const periodStats = {};
    statuses.forEach(status => {
      const found = periodByStatus.find(s => s._id === status);
      periodStats[status] = found ? found.count : 0;
    });
    periodStats.total = Object.values(periodStats).reduce((a, b) => a + b, 0);

    res.status(200).json({
      success: true,
      data: {
        chartData,
        totalStats,
        periodStats,
        months: monthsCount,
        statusLabels,
        suppliers,
        selectedSupplierId: supplierId || 'all',
        endingContracts: {
          list: endingContracts,
          count: endingContractsCount
        },
        endingContractsByMonth: endingContractsChartData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ending contracts forecast (separate from contract statistics)
// @route   GET /api/statistics/ending-forecast
// @access  Private
exports.getEndingForecast = async (req, res, next) => {
  try {
    const beraterId = req.user._id;
    const { months = 6, supplierId } = req.query;
    const monthsCount = Math.min(Math.max(parseInt(months), 1), 24); // 1-24 Monate

    // Basis-Match-Bedingung
    const baseMatch = { beraterId };
    if (supplierId && supplierId !== 'all') {
      baseMatch.supplierId = new mongoose.Types.ObjectId(supplierId);
    }

    // Zeitraum für endende Verträge
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endPeriodDate = new Date();
    endPeriodDate.setMonth(endPeriodDate.getMonth() + monthsCount);
    endPeriodDate.setHours(23, 59, 59, 999);

    // Verträge, die im ausgewählten Zeitraum enden
    const endingContracts = await Contract.find({
      ...baseMatch,
      status: 'active',
      endDate: { $gte: today, $lte: endPeriodDate }
    })
      .populate('customerId', 'firstName lastName customerNumber')
      .populate('supplierId', 'name shortName')
      .sort({ endDate: 1 })
      .lean();

    const endingContractsCount = endingContracts.length;

    // Future months array for labels
    const futureMonthsArray = [];
    for (let i = 0; i < monthsCount; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      futureMonthsArray.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
      });
    }

    // Aggregation: Aktive Verträge nach Enddatum (Monat) gruppieren
    const contractsEndingByMonth = await Contract.aggregate([
      {
        $match: {
          ...baseMatch,
          status: 'active',
          endDate: { $gte: today, $lte: endPeriodDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$endDate' },
            month: { $month: '$endDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Erstelle Chart-Daten für Vertragsende-Prognose
    const endingContractsByMonth = {
      labels: futureMonthsArray.map(m => m.label),
      data: futureMonthsArray.map(m => {
        const found = contractsEndingByMonth.find(
          d => d._id.year === m.year && d._id.month === m.month
        );
        return found ? found.count : 0;
      })
    };

    // Anbieter-Liste für Filter laden
    const suppliers = await Supplier.find({ beraterId })
      .select('_id name shortName')
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        endingContracts: {
          list: endingContracts,
          count: endingContractsCount
        },
        endingContractsByMonth,
        months: monthsCount,
        suppliers,
        selectedSupplierId: supplierId || 'all'
      }
    });
  } catch (error) {
    next(error);
  }
};
