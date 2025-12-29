const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Token generieren
exports.generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

// Refresh Token generieren
exports.generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// Auth Middleware
exports.authenticate = async (req, res, next) => {
  try {
    // Token aus Header extrahieren
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Kein Token vorhanden'
      });
    }

    const token = authHeader.substring(7);

    // Token verifizieren
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User laden
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Ungültiger Token oder Benutzer inaktiv'
      });
    }

    // Prüfe ob Benutzer blockiert ist
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Ihr Konto wurde blockiert. Grund: ' + (user.blockedReason || 'Keine Angabe')
      });
    }

    // User an Request anhängen
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token abgelaufen'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Ungültiger Token'
    });
  }
};

// Admin-only Middleware
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Admin-Rechte erforderlich'
    });
  }
  next();
};

// Superadmin-only Middleware
exports.requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Superadmin-Rechte erforderlich'
    });
  }
  next();
};

// Auth Middleware für Bild-URLs (akzeptiert Token aus Query-Parameter)
exports.authenticateFromQuery = async (req, res, next) => {
  try {
    // Token aus Query-Parameter extrahieren
    const token = req.query.token;

    if (!token) {
      return res.status(401).send('Kein Token vorhanden');
    }

    // Token verifizieren
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User laden
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).send('Ungültiger Token oder Benutzer inaktiv');
    }

    // Prüfe ob Benutzer blockiert ist
    if (user.isBlocked) {
      return res.status(403).send('Ihr Konto wurde blockiert');
    }

    // User an Request anhängen
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send('Token abgelaufen');
    }

    return res.status(401).send('Ungültiger Token');
  }
};
