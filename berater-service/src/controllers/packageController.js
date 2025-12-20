const Package = require('../models/Package');
const User = require('../models/User');
const Contract = require('../models/Contract');

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const packages = await Package.find(filter).sort({ order: 1 });

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Pakete',
      error: error.message
    });
  }
};

// Get single package
exports.getPackage = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);

    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Paket nicht gefunden'
      });
    }

    res.json({
      success: true,
      data: package
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden des Pakets',
      error: error.message
    });
  }
};

// Create package (Superadmin only)
exports.createPackage = async (req, res) => {
  try {
    const package = await Package.create(req.body);

    res.status(201).json({
      success: true,
      data: package,
      message: 'Paket erfolgreich erstellt'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ein Paket mit diesem Namen existiert bereits'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Fehler beim Erstellen des Pakets',
      error: error.message
    });
  }
};

// Update package (Superadmin only)
exports.updatePackage = async (req, res) => {
  try {
    const package = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Paket nicht gefunden'
      });
    }

    res.json({
      success: true,
      data: package,
      message: 'Paket erfolgreich aktualisiert'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Aktualisieren des Pakets',
      error: error.message
    });
  }
};

// Delete package (Superadmin only)
exports.deletePackage = async (req, res) => {
  try {
    // Check if any users are using this package
    const usersWithPackage = await User.countDocuments({
      package: req.params.id
    });

    if (usersWithPackage > 0) {
      return res.status(400).json({
        success: false,
        message: `Dieses Paket wird von ${usersWithPackage} Benutzer(n) verwendet und kann nicht gelöscht werden`
      });
    }

    const package = await Package.findByIdAndDelete(req.params.id);

    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Paket nicht gefunden'
      });
    }

    res.json({
      success: true,
      message: 'Paket erfolgreich gelöscht'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Löschen des Pakets',
      error: error.message
    });
  }
};

// Check user's package limits
exports.checkUserLimits = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user with package details
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    // Get package details
    const userPackage = await Package.findOne({ name: user.package });

    if (!userPackage) {
      return res.status(404).json({
        success: false,
        message: 'Paket nicht gefunden'
      });
    }

    // Count current usage
    const contractCount = await Contract.countDocuments({ beraterId: userId });
    // For now, we'll use simple counts. In the future, you could add Customer and Meter counts
    const customerCount = 0; // await Customer.countDocuments({ beraterId: userId });
    const meterCount = 0; // await Meter.countDocuments({ beraterId: userId });

    const data = {
      package: userPackage,
      usage: {
        contracts: contractCount,
        customers: customerCount,
        meters: meterCount
      },
      limits: {
        maxContracts: userPackage.maxContracts,
        maxCustomers: userPackage.maxCustomers,
        maxMeters: userPackage.maxMeters,
        contractsRemaining: userPackage.maxContracts === -1 ? -1 : Math.max(0, userPackage.maxContracts - contractCount),
        customersRemaining: userPackage.maxCustomers === -1 ? -1 : Math.max(0, userPackage.maxCustomers - customerCount),
        metersRemaining: userPackage.maxMeters === -1 ? -1 : Math.max(0, userPackage.maxMeters - meterCount),
        isAtContractLimit: userPackage.maxContracts !== -1 && contractCount >= userPackage.maxContracts,
        isAtCustomerLimit: userPackage.maxCustomers !== -1 && customerCount >= userPackage.maxCustomers,
        isAtMeterLimit: userPackage.maxMeters !== -1 && meterCount >= userPackage.maxMeters
      }
    };

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Prüfen der Limits',
      error: error.message
    });
  }
};

// Upgrade/Downgrade user package
exports.upgradeUserPackage = async (req, res) => {
  try {
    const { packageName } = req.body;
    const userId = req.user._id;

    const targetPackage = await Package.findOne({ name: packageName });

    if (!targetPackage) {
      return res.status(404).json({
        success: false,
        message: 'Paket nicht gefunden'
      });
    }

    if (!targetPackage.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Dieses Paket ist nicht verfügbar'
      });
    }

    // Get current user package for comparison
    const user = await User.findById(userId);
    const currentPackage = await Package.findOne({ name: user.package });

    // Check if downgrading and validate usage doesn't exceed new limits
    if (currentPackage && targetPackage.order < currentPackage.order) {
      // Count current usage
      const contractCount = await Contract.countDocuments({ beraterId: userId });

      // Check if current usage exceeds new package limits
      if (targetPackage.maxContracts !== -1 && contractCount > targetPackage.maxContracts) {
        return res.status(400).json({
          success: false,
          message: `Downgrade nicht möglich: Sie haben derzeit ${contractCount} Verträge, aber das ${targetPackage.displayName}-Paket erlaubt nur ${targetPackage.maxContracts} Verträge. Bitte löschen Sie zuerst einige Verträge.`,
          currentUsage: contractCount,
          newLimit: targetPackage.maxContracts
        });
      }
    }

    // Update user's package
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        package: targetPackage.name,
        packageLimits: {
          maxCustomers: targetPackage.maxCustomers,
          maxContracts: targetPackage.maxContracts,
          maxMeters: targetPackage.maxMeters
        }
      },
      { new: true }
    ).select('-passwordHash');

    const action = currentPackage && targetPackage.order < currentPackage.order ? 'downgegradet' : 'upgegradet';

    res.json({
      success: true,
      data: updatedUser,
      message: `Erfolgreich auf ${targetPackage.displayName} ${action}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Paket-Wechsel',
      error: error.message
    });
  }
};
