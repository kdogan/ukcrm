const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { authMiddleware } = require('../middleware/auth.middleware');

// @route   POST /api/auth/register
// @desc    Registriere neuen Berater (Admin-Funktion)
// @access  Public (sollte in Produktion geschützt sein)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 12 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, phone, role } = req.body;

    // Prüfe ob User bereits existiert
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Benutzer mit dieser E-Mail existiert bereits'
      });
    }

    // Erstelle neuen User
    const user = new User({
      email,
      passwordHash: password, // Wird im Pre-Save Hook gehasht
      firstName,
      lastName,
      phone,
      role: role || 'berater'
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Benutzer erfolgreich registriert',
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Login Berater
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // User suchen
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Ungültige Anmeldedaten'
      });
    }

    // Passwort prüfen
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Ungültige Anmeldedaten'
      });
    }

    // JWT Token generieren
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Erfolgreich angemeldet',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          settings: user.settings
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Token erneuern
// @access  Public
router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh Token erforderlich'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Ungültiger Refresh Token'
      });
    }

    const newToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30m' }
    );

    res.json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Aktuellen User abrufen
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// @route   PUT /api/auth/profile
// @desc    Profil aktualisieren
// @access  Private
router.put('/profile', authMiddleware, [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().trim()
], async (req, res, next) => {
  try {
    const { firstName, lastName, phone, emailNotifications } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({
      success: true,
      message: 'Profil aktualisiert',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/change-password
// @desc    Passwort ändern
// @access  Private
router.put('/change-password', authMiddleware, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 12 })
], async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Aktuelles Passwort ist falsch'
      });
    }

    user.passwordHash = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Passwort erfolgreich geändert'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/settings
// @desc    Einstellungen des Benutzers abrufen
// @access  Private
router.get('/settings', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('settings');

    res.json({
      success: true,
      data: user.settings || {
        reminderDays: {
          days90: true,
          days60: true,
          days30: true
        },
        sidebarLabels: {
          dashboard: 'Dashboard',
          customers: 'Kunden',
          meters: 'Zähler',
          contracts: 'Verträge',
          todos: 'TODOs'
        },
        notifications: {
          email: true,
          browser: false
        },
        theme: {
          sidebarColor: 'mint'
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/settings
// @desc    Einstellungen des Benutzers aktualisieren
// @access  Private
router.put('/settings', authMiddleware, async (req, res, next) => {
  try {
    const { settings } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { settings },
      { new: true, runValidators: true }
    ).select('settings');

    res.json({
      success: true,
      message: 'Einstellungen gespeichert',
      data: user.settings
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
