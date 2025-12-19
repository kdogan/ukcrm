const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Meter = require('../models/meter.model');
const MeterHistory = require('../models/meterHistory.model');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// GET /api/meters - Alle Zähler
router.get('/', async (req, res, next) => {
  try {
    const { status, type, search } = req.query;
    const query = { beraterId: req.user._id };

    if (status === 'free') query.currentCustomerId = null;
    if (status === 'occupied') query.currentCustomerId = { $ne: null };
    if (type) query.type = type;
    if (search) query.meterNumber = new RegExp(search, 'i');

    const meters = await Meter.find(query)
      .populate('currentCustomerId', 'firstName lastName customerNumber')
      .sort({ meterNumber: 1 });

    res.json({ success: true, data: meters });
  } catch (error) {
    next(error);
  }
});

// GET /api/meters/:id - Einzelner Zähler
router.get('/:id', async (req, res, next) => {
  try {
    const meter = await Meter.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    }).populate('currentCustomerId', 'firstName lastName');

    if (!meter) {
      return res.status(404).json({ success: false, message: 'Zähler nicht gefunden' });
    }

    res.json({ success: true, data: meter });
  } catch (error) {
    next(error);
  }
});

// GET /api/meters/:id/history - Zähler-Historie
router.get('/:id/history', async (req, res, next) => {
  try {
    const history = await MeterHistory.find({
      meterId: req.params.id,
      beraterId: req.user._id
    })
      .populate('customerId', 'firstName lastName customerNumber')
      .populate('contractId', 'contractNumber')
      .sort({ startDate: -1 });

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

// POST /api/meters - Zähler anlegen
router.post('/', [
  body('meterNumber').trim().notEmpty(),
  body('type').isIn(['electricity', 'gas', 'water'])
], async (req, res, next) => {
  try {
    const meter = new Meter({
      ...req.body,
      beraterId: req.user._id
    });

    await meter.save();
    res.status(201).json({ success: true, message: 'Zähler angelegt', data: meter });
  } catch (error) {
    next(error);
  }
});

// POST /api/meters/:id/assign - Zähler zuordnen
router.post('/:id/assign', [
  body('customerId').notEmpty(),
  body('startDate').isISO8601(),
  body('contractId').optional()
], async (req, res, next) => {
  try {
    const { customerId, startDate, contractId } = req.body;

    const meter = await Meter.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!meter) {
      return res.status(404).json({ success: false, message: 'Zähler nicht gefunden' });
    }

    // Aktuelle Zuordnung beenden
    if (meter.currentCustomerId) {
      await MeterHistory.updateOne(
        { meterId: meter._id, endDate: null },
        { endDate: new Date(startDate) }
      );
    }

    // Neue Historie erstellen
    const history = new MeterHistory({
      meterId: meter._id,
      beraterId: req.user._id,
      customerId,
      contractId: contractId || null,
      startDate: new Date(startDate),
      endDate: null
    });

    await history.save();

    // Meter aktualisieren
    meter.currentCustomerId = customerId;
    await meter.save();

    res.json({ success: true, message: 'Zähler zugeordnet', data: meter });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
