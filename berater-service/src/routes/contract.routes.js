const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Contract = require('../models/contract.model');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// GET /api/contracts - Alle Verträge
router.get('/', async (req, res, next) => {
  try {
    const { status, supplierId, daysRemaining } = req.query;
    const query = { beraterId: req.user._id };

    if (status) query.status = status;
    if (supplierId) query.supplierId = supplierId;

    if (daysRemaining) {
      const days = parseInt(daysRemaining);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      query.endDate = { $lte: futureDate, $gte: new Date() };
      query.status = 'active';
    }

    const contracts = await Contract.find(query)
      .populate('customerId', 'firstName lastName customerNumber')
      .populate('meterId', 'meterNumber type')
      .populate('supplierId', 'name shortName')
      .sort({ endDate: 1 })
      .select('-auditLog');

    res.json({ success: true, data: contracts });
  } catch (error) {
    next(error);
  }
});

// GET /api/contracts/:id - Einzelner Vertrag
router.get('/:id', async (req, res, next) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    })
      .populate('customerId')
      .populate('meterId')
      .populate('supplierId')
      .populate('auditLog.userId', 'firstName lastName');

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Vertrag nicht gefunden' });
    }

    res.json({ success: true, data: contract });
  } catch (error) {
    next(error);
  }
});

// POST /api/contracts - Vertrag anlegen
router.post('/', [
  body('customerId').notEmpty(),
  body('meterId').notEmpty(),
  body('supplierId').notEmpty(),
  body('startDate').isISO8601(),
  body('durationMonths').isInt({ min: 1, max: 120 })
], async (req, res, next) => {
  try {
    const contract = new Contract({
      ...req.body,
      beraterId: req.user._id
    });

    contract.addAuditLog(req.user._id, 'created');
    await contract.save();

    res.status(201).json({ success: true, message: 'Vertrag angelegt', data: contract });
  } catch (error) {
    next(error);
  }
});

// PUT /api/contracts/:id - Vertrag bearbeiten
router.put('/:id', async (req, res, next) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Vertrag nicht gefunden' });
    }

    const allowedUpdates = ['durationMonths', 'endDate', 'notes'];
    const changes = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        changes[field] = { old: contract[field], new: req.body[field] };
        contract[field] = req.body[field];
      }
    });

    contract.addAuditLog(req.user._id, 'updated', changes);
    await contract.save();

    res.json({ success: true, message: 'Vertrag aktualisiert', data: contract });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/contracts/:id/status - Status ändern
router.patch('/:id/status', [
  body('status').isIn(['active', 'ended', 'archived'])
], async (req, res, next) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Vertrag nicht gefunden' });
    }

    contract.status = req.body.status;
    contract.addAuditLog(req.user._id, 'status_changed', {
      status: { old: contract.status, new: req.body.status }
    });
    await contract.save();

    res.json({ success: true, message: 'Status geändert', data: contract });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
