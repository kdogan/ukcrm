const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
exports.getSuppliers = async (req, res, next) => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;
    const User = require('../models/User');

    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Shared visibility: Berater sees own suppliers + Masterberater's suppliers
    const user = await User.findById(req.user._id);

    if (user.masterBerater) {
      // Regular Berater: see own suppliers + masterberater's suppliers
      filter.beraterId = { $in: [req.user._id, user.masterBerater] };
    } else {
      // Masterberater or standalone Berater: see only own suppliers
      filter.beraterId = req.user._id;
    }

    const skip = (page - 1) * limit;
    const total = await Supplier.countDocuments(filter);

    const suppliers = await Supplier.find(filter)
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      data: suppliers,
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

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
exports.getSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Anbieter nicht gefunden'
      });
    }

    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private
exports.createSupplier = async (req, res, next) => {
  try {
    const supplierData = {
      ...req.body,
      beraterId: req.user._id
    };

    const supplier = await Supplier.create(supplierData);

    res.status(201).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin only)
exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Anbieter nicht gefunden'
      });
    }

    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin only)
exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Anbieter nicht gefunden'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Anbieter deaktiviert'
    });
  } catch (error) {
    next(error);
  }
};
