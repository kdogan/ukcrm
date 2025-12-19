const Reminder = require('../models/Reminder');
const Contract = require('../models/Contract');
const Customer = require('../models/Customer');
const Meter = require('../models/Meter');

// @desc    Get all reminders
// @route   GET /api/reminders
// @access  Private
exports.getReminders = async (req, res, next) => {
  try {
    const { status = 'open', page = 1, limit = 50 } = req.query;

    const filter = { beraterId: req.user._id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const total = await Reminder.countDocuments(filter);

    const reminders = await Reminder.find(filter)
      .populate({
        path: 'contractId',
        populate: [
          { path: 'customerId', select: 'firstName lastName customerNumber' },
          { path: 'supplierId', select: 'name shortName' }
        ]
      })
      .sort({ dueDate: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      data: reminders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark reminder as done
// @route   PATCH /api/reminders/:id/done
// @access  Private
exports.markReminderDone = async (req, res, next) => {
  try {
    const { note } = req.body;

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Erinnerung nicht gefunden'
      });
    }

    reminder.status = 'done';
    if (note) reminder.note = note;
    await reminder.save();

    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark reminder as ignored
// @route   PATCH /api/reminders/:id/ignore
// @access  Private
exports.ignoreReminder = async (req, res, next) => {
  try {
    const { note } = req.body;

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Erinnerung nicht gefunden'
      });
    }

    reminder.status = 'ignored';
    if (note) reminder.note = note;
    await reminder.save();

    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    next(error);
  }
};

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

    // Offene Erinnerungen
    const openReminders = await Reminder.countDocuments({
      beraterId,
      status: 'open'
    });

    const urgentReminders = await Reminder.countDocuments({
      beraterId,
      status: 'open',
      dueDate: { $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      success: true,
      data: {
        expiringContracts,
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
          total: openReminders,
          urgent: urgentReminders
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
