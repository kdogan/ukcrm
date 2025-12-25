const Contract = require('../models/Contract');
const Package = require('../models/Package');

// Check if user can create more contracts
exports.checkContractLimit = async (req, res, next) => {
  try {
    const user = req.user;

    // Superadmin and admin have no limits
    if (user.role === 'superadmin' || user.role === 'admin') {
      return next();
    }

    // Get user's package
    const userPackage = await Package.findOne({ name: user.package });

    if (!userPackage) {
      return res.status(500).json({
        success: false,
        message: 'Paket-Konfiguration nicht gefunden'
      });
    }

    // Count current contracts (only active and draft contracts)
    const contractCount = await Contract.countDocuments({
      beraterId: user._id,
      status: { $in: ['active', 'draft'] }
    });

    // Check if limit is reached
    if (contractCount >= userPackage.maxContracts) {
      return res.status(403).json({
        success: false,
        message: `Vertragslimit erreicht! Ihr ${userPackage.displayName}-Paket erlaubt maximal ${userPackage.maxContracts} Verträge.`,
        limitReached: true,
        currentPackage: userPackage.name,
        currentCount: contractCount,
        maxAllowed: userPackage.maxContracts,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Prüfen des Vertragslimits',
      error: error.message
    });
  }
};
