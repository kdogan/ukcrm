const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/auth');

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

    // User ohne Passwort zurückgeben
    const userObj = user.toJSON();

    res.status(200).json({
      success: true,
      data: {
        user: userObj,
        token,
        refreshToken
      }
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
