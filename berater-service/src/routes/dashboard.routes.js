const express = require('express');
const router = express.Router();
const Contract = require('../models/contract.model');
const Customer = require('../models/customer.model');
const Meter = require('../models/meter.model');
const Reminder = require('../models/reminder.model');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// GET /api/dashboard/stats
router.get('/stats', async (req, res, next) => {
  try {
    const beraterId = req.user._id;

    // Parallel queries für Performance
    const [
      expiringContracts,
      contractsBySupplier,
      activeCustomers,
      inactiveCustomers,
      freeMeters,
      occupiedMeters,
      openReminders
    ] = await Promise.all([
      // Top 10 auslaufende Verträge
      Contract.find({
        beraterId,
        status: 'active',
        endDate: { $gte: new Date() }
      })
        .sort({ endDate: 1 })
        .limit(10)
        .populate('customerId', 'firstName lastName')
        .populate('supplierId', 'name')
        .select('contractNumber endDate'),

      // Verträge nach Anbieter
      Contract.aggregate([
        { $match: { beraterId, status: 'active' } },
        {
          $group: {
            _id: '$supplierId',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'suppliers',
            localField: '_id',
            foreignField: '_id',
            as: 'supplier'
          }
        },
        { $unwind: '$supplier' },
        {
          $project: {
            name: '$supplier.name',
            count: 1
          }
        }
      ]),

      // Aktive Kunden
      Customer.countDocuments({ beraterId, isActive: true }),

      // Inaktive Kunden
      Customer.countDocuments({ beraterId, isActive: false }),

      // Freie Zähler
      Meter.countDocuments({ beraterId, currentCustomerId: null }),

      // Belegte Zähler
      Meter.countDocuments({ beraterId, currentCustomerId: { $ne: null } }),

      // Offene Erinnerungen
      Reminder.aggregate([
        { $match: { beraterId, status: 'open' } },
        {
          $project: {
            priority: {
              $switch: {
                branches: [
                  {
                    case: {
                      $lte: ['$dueDate', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
                    },
                    then: 'high'
                  },
                  {
                    case: {
                      $lte: ['$dueDate', new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)]
                    },
                    then: 'medium'
                  }
                ],
                default: 'low'
              }
            }
          }
        },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Erinnerungen nach Priorität formatieren
    const remindersByPriority = {
      high: 0,
      medium: 0,
      low: 0
    };
    openReminders.forEach(r => {
      remindersByPriority[r._id] = r.count;
    });

    res.json({
      success: true,
      data: {
        expiringContracts,
        contractsBySupplier,
        customers: {
          active: activeCustomers,
          inactive: inactiveCustomers,
          total: activeCustomers + inactiveCustomers
        },
        meters: {
          free: freeMeters,
          occupied: occupiedMeters,
          total: freeMeters + occupiedMeters
        },
        reminders: remindersByPriority
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
