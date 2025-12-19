const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Customer = require('../models/customer.model');
const { authMiddleware } = require('../middleware/auth.middleware');

// Alle Routen benötigen Authentifizierung
router.use(authMiddleware);

// @route   GET /api/customers
// @desc    Alle Kunden des Beraters abrufen
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { isActive, search, page = 1, limit = 20 } = req.query;

    const query = { beraterId: req.user._id };
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { customerNumber: new RegExp(search, 'i') }
      ];
    }

    const customers = await Customer.find(query)
      .sort({ lastName: 1, firstName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-auditLog');

    const count = await Customer.countDocuments(query);

    res.json({
      success: true,
      data: customers,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/customers/:id
// @desc    Einzelnen Kunden abrufen
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    }).populate('auditLog.userId', 'firstName lastName');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Kunde nicht gefunden'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/customers
// @desc    Neuen Kunden anlegen
// @access  Private
router.post('/', [
  body('firstName').trim().notEmpty().withMessage('Vorname ist erforderlich'),
  body('lastName').trim().notEmpty().withMessage('Nachname ist erforderlich'),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('notes').optional().isLength({ max: 2000 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Mindestens E-Mail oder Telefon erforderlich
    if (!req.body.email && !req.body.phone) {
      return res.status(400).json({
        success: false,
        message: 'E-Mail oder Telefonnummer ist erforderlich'
      });
    }

    const customer = new Customer({
      ...req.body,
      beraterId: req.user._id
    });

    customer.addAuditLog(req.user._id, 'created');
    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Kunde erfolgreich angelegt',
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/customers/:id
// @desc    Kunden bearbeiten
// @access  Private
router.put('/:id', [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('notes').optional().isLength({ max: 2000 })
], async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Kunde nicht gefunden'
      });
    }

    const changes = {};
    const allowedUpdates = ['firstName', 'lastName', 'email', 'phone', 'address', 'dateOfBirth', 'notes'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        changes[field] = { old: customer[field], new: req.body[field] };
        customer[field] = req.body[field];
      }
    });

    customer.addAuditLog(req.user._id, 'updated', changes);
    await customer.save();

    res.json({
      success: true,
      message: 'Kunde aktualisiert',
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/customers/:id/deactivate
// @desc    Kunden deaktivieren
// @access  Private
router.patch('/:id/deactivate', async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Kunde nicht gefunden'
      });
    }

    customer.isActive = false;
    customer.addAuditLog(req.user._id, 'deactivated');
    await customer.save();

    res.json({
      success: true,
      message: 'Kunde deaktiviert',
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/customers/:id/reactivate
// @desc    Kunden reaktivieren
// @access  Private
router.patch('/:id/reactivate', async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Kunde nicht gefunden'
      });
    }

    customer.isActive = true;
    customer.addAuditLog(req.user._id, 'reactivated');
    await customer.save();

    res.json({
      success: true,
      message: 'Kunde reaktiviert',
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
