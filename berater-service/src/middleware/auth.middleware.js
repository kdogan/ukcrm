const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
  try {
    // Token aus Header extrahieren
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Kein Token vorhanden. Bitte authentifizieren.'
      });
    }

    const token = authHeader.split(' ')[1];

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

    // User an Request anhängen
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Ungültiger Token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token abgelaufen. Bitte erneut anmelden.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Fehler bei der Authentifizierung'
    });
  }
};

// Admin-Middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Zugriff verweigert. Admin-Rechte erforderlich.'
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
