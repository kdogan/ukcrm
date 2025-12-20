const User = require('../models/User');
const Package = require('../models/Package');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const emailService = require('../services/emailService');
const crypto = require('crypto');

// @desc    Register new berater
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validierung
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'E-Mail, Passwort, Vorname und Nachname sind erforderlich'
      });
    }

    // Passwort-Länge prüfen
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Passwort muss mindestens 8 Zeichen lang sein'
      });
    }

    // Prüfen ob E-Mail bereits existiert
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'E-Mail-Adresse ist bereits registriert'
      });
    }

    // Basic-Paket aus der Datenbank holen
    const basicPackage = await Package.findOne({ name: 'basic' });

    // Package-Limits setzen
    let packageLimits = {
      maxCustomers: 50,
      maxContracts: 100,
      maxMeters: 50
    };

    // Wenn Basic-Paket in DB existiert, dessen Limits verwenden
    if (basicPackage) {
      packageLimits = {
        maxCustomers: basicPackage.maxCustomers,
        maxContracts: basicPackage.maxContracts,
        maxMeters: basicPackage.maxMeters
      };
    }

    // Email-Verifizierungs-Token generieren
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Stunden

    // Neuen User erstellen
    const user = await User.create({
      email,
      passwordHash: password, // wird im pre-save hook gehasht
      firstName,
      lastName,
      phone: phone || '',
      role: 'berater',
      package: 'basic',
      packageLimits,
      isActive: false, // Nicht aktiv bis Email verifiziert
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    // Verifizierungs-Email senden
    try {
      await emailService.sendVerificationEmail(email, firstName, verificationToken);
    } catch (emailError) {
      console.error('Fehler beim Senden der Verifizierungs-Email:', emailError);
      // Wir werfen hier keinen Fehler, damit die Registrierung trotzdem erfolgreich ist
    }

    res.status(201).json({
      success: true,
      message: 'Registrierung erfolgreich. Bitte überprüfen Sie Ihre E-Mails, um Ihr Konto zu aktivieren.',
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        requiresEmailVerification: true
      }
    });
  } catch (error) {
    // MongoDB Duplicate Key Error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'E-Mail-Adresse ist bereits registriert'
      });
    }
    next(error);
  }
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validierung
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-Mail und Passwort sind erforderlich'
      });
    }

    // User suchen (inkl. Passwort)
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Ungültige Anmeldedaten'
      });
    }

    // Passwort prüfen
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Ungültige Anmeldedaten'
      });
    }

    // Prüfe ob Email verifiziert
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Überprüfen Sie Ihr E-Mail-Postfach.',
        emailNotVerified: true
      });
    }

    // Prüfe ob aktiv
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Konto ist deaktiviert'
      });
    }

    // Tokens generieren
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // User ohne Passwort zurückgeben, inkl. Settings
    const userObj = user.toJSON();

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...userObj,
          settings: user.settings || {
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
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // User mit diesem Token finden
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Ungültiger oder abgelaufener Verifizierungs-Link'
      });
    }

    // Email als verifiziert markieren
    user.isEmailVerified = true;
    user.isActive = true; // Konto aktivieren
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'E-Mail-Adresse erfolgreich bestätigt. Sie können sich jetzt einloggen.',
      data: {
        email: user.email,
        firstName: user.firstName
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend Verification Email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'E-Mail-Adresse ist erforderlich'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'E-Mail-Adresse ist bereits verifiziert'
      });
    }

    // Neuen Token generieren
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Email erneut senden
    try {
      await emailService.sendVerificationEmail(email, user.firstName, verificationToken);
    } catch (emailError) {
      console.error('Fehler beim Senden der Verifizierungs-Email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Fehler beim Senden der E-Mail. Bitte versuchen Sie es später erneut.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verifizierungs-E-Mail wurde erneut gesendet. Bitte überprüfen Sie Ihr Postfach.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // In einer realen App würde man hier den Token invalidieren
    // z.B. in einer Redis Blacklist
    res.status(200).json({
      success: true,
      message: 'Erfolgreich abgemeldet'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, emailNotifications } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, emailNotifications },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Aktuelles und neues Passwort sind erforderlich'
      });
    }

    // User mit Passwort laden
    const user = await User.findById(req.user._id).select('+passwordHash');

    // Aktuelles Passwort prüfen
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Aktuelles Passwort ist falsch'
      });
    }

    // Neues Passwort setzen
    user.passwordHash = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Passwort erfolgreich geändert'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user settings
// @route   GET /api/auth/settings
// @access  Private
exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('settings');

    const defaultSettings = {
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
    };

    res.status(200).json({
      success: true,
      data: user.settings || defaultSettings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user settings
// @route   PUT /api/auth/settings
// @access  Private
exports.updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { settings },
      { new: true, runValidators: true }
    ).select('settings');

    res.status(200).json({
      success: true,
      message: 'Einstellungen gespeichert',
      data: user.settings
    });
  } catch (error) {
    next(error);
  }
};
