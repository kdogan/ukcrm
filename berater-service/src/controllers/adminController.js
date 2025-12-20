const User = require('../models/User');
const bcrypt = require('bcrypt');

// Paket-Konfigurationen
const PACKAGE_LIMITS = {
  basic: {
    maxCustomers: 50,
    maxContracts: 100,
    maxMeters: 50
  },
  professional: {
    maxCustomers: 200,
    maxContracts: 500,
    maxMeters: 200
  },
  enterprise: {
    maxCustomers: -1, // Unbegrenzt
    maxContracts: -1,
    maxMeters: -1
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Superadmin only
exports.getAllUsers = async (req, res, next) => {
  try {
    const {
      role,
      package: packageType,
      isActive,
      isBlocked,
      page = 1,
      limit = 50
    } = req.query;

    const filter = {};

    if (role) filter.role = role;
    if (packageType) filter.package = packageType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Superadmin only
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Superadmin only
exports.createUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, role, package: packageType } = req.body;

    // Prüfe ob User bereits existiert
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Benutzer mit dieser E-Mail existiert bereits'
      });
    }

    // Setze Paket-Limits basierend auf dem gewählten Paket
    const limits = PACKAGE_LIMITS[packageType || 'basic'];

    const user = await User.create({
      email,
      passwordHash: password, // Wird automatisch gehasht durch pre-save hook
      firstName,
      lastName,
      phone,
      role: role || 'berater',
      package: packageType || 'basic',
      packageLimits: limits
    });

    // Passwort aus Response entfernen
    const userObj = user.toJSON();

    res.status(201).json({
      success: true,
      data: userObj,
      message: 'Benutzer erfolgreich erstellt'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Superadmin only
exports.updateUser = async (req, res, next) => {
  try {
    const { email, firstName, lastName, phone, role, package: packageType, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    // Verhindere dass Superadmin sich selbst degradiert
    if (user._id.toString() === req.user._id.toString() && role !== 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'Sie können Ihre eigene Rolle nicht ändern'
      });
    }

    // Update Felder
    if (email) user.email = email;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    // Update Paket und Limits
    if (packageType && packageType !== user.package) {
      user.package = packageType;
      user.packageLimits = PACKAGE_LIMITS[packageType];
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.toJSON(),
      message: 'Benutzer erfolgreich aktualisiert'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block user
// @route   PATCH /api/admin/users/:id/block
// @access  Superadmin only
exports.blockUser = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    // Verhindere dass Superadmin sich selbst blockiert
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Sie können sich nicht selbst blockieren'
      });
    }

    // Verhindere dass andere Superadmins blockiert werden
    if (user.role === 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'Superadmins können nicht blockiert werden'
      });
    }

    user.isBlocked = true;
    user.blockedReason = reason || 'Keine Angabe';
    user.blockedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      data: user.toJSON(),
      message: 'Benutzer erfolgreich blockiert'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock user
// @route   PATCH /api/admin/users/:id/unblock
// @access  Superadmin only
exports.unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    user.isBlocked = false;
    user.blockedReason = undefined;
    user.blockedAt = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      data: user.toJSON(),
      message: 'Benutzer erfolgreich entsperrt'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Superadmin only
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    // Verhindere dass Superadmin sich selbst löscht
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Sie können sich nicht selbst löschen'
      });
    }

    // Verhindere dass andere Superadmins gelöscht werden
    if (user.role === 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'Superadmins können nicht gelöscht werden'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Benutzer erfolgreich gelöscht'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/stats
// @access  Superadmin only
exports.getUserStats = async (req, res, next) => {
  try {
    const total = await User.countDocuments();
    const active = await User.countDocuments({ isActive: true, isBlocked: false });
    const blocked = await User.countDocuments({ isBlocked: true });
    const inactive = await User.countDocuments({ isActive: false });

    const byRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const byPackage = await User.aggregate([
      { $group: { _id: '$package', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        blocked,
        inactive,
        byRole: byRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPackage: byPackage.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user password
// @route   PATCH /api/admin/users/:id/reset-password
// @access  Superadmin only
exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Passwort muss mindestens 8 Zeichen lang sein'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    user.passwordHash = newPassword; // Wird automatisch gehasht durch pre-save hook
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Passwort erfolgreich zurückgesetzt'
    });
  } catch (error) {
    next(error);
  }
};
