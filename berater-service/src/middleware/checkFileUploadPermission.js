const Package = require('../models/Package');

/**
 * Middleware zur Prüfung der File-Upload-Berechtigung
 * Überprüft ob das Paket des Benutzers das Feature 'file_upload' aktiviert hat
 */
const checkFileUploadPermission = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Nicht authentifiziert'
      });
    }

    // Superadmin und Admin haben immer Zugriff
    if (user.role === 'superadmin' || user.role === 'admin') {
      return next();
    }

    // Hole Package-Informationen
    const userPackage = await Package.findOne({
      name: user.package,
      isActive: true
    });

    if (!userPackage) {
      return res.status(500).json({
        success: false,
        message: 'Paket-Konfiguration nicht gefunden'
      });
    }

    // Prüfe ob File-Upload-Feature aktiviert ist
    const fileUploadFeature = userPackage.features.find(
      feature => feature.name === 'file_upload'
    );

    if (!fileUploadFeature || !fileUploadFeature.enabled) {
      return res.status(403).json({
        success: false,
        message: 'File-Upload ist in Ihrem aktuellen Paket nicht verfügbar',
        featureNotAvailable: true,
        currentPackage: userPackage.name,
        upgradeRequired: true
      });
    }

    // Feature ist verfügbar
    next();
  } catch (error) {
    console.error('Fehler bei File-Upload-Berechtigungsprüfung:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Prüfen der Upload-Berechtigung',
      error: error.message
    });
  }
};

module.exports = { checkFileUploadPermission };
