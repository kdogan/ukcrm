const Customer = require('../models/Customer');

// @desc    Get all customers (nur eigene)
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res, next) => {
  try {
    const { isActive, search, page = 1, limit = 20 } = req.query;

    // Filter
    const filter = { beraterId: req.user._id };
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Suche
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { customerNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await Customer.countDocuments(filter);

    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      data: customers,
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

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Kunde nicht gefunden'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res, next) => {
  try {
    const customerData = {
      ...req.body,
      beraterId: req.user._id,
      auditLog: [{
        userId: req.user._id,
        action: 'created',
        timestamp: new Date()
      }]
    };

    const customer = await Customer.create(customerData);

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Kunde nicht gefunden'
      });
    }

    // Audit Log
    const changes = {};
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'dateOfBirth', 'notes'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== customer[field]) {
        changes[field] = { old: customer[field], new: req.body[field] };
        customer[field] = req.body[field];
      }
    });

    customer.auditLog.push({
      userId: req.user._id,
      action: 'updated',
      changes,
      timestamp: new Date()
    });

    await customer.save();

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate customer
// @route   PATCH /api/customers/:id/deactivate
// @access  Private
exports.deactivateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Kunde nicht gefunden'
      });
    }

    customer.isActive = false;
    customer.auditLog.push({
      userId: req.user._id,
      action: 'deactivated',
      timestamp: new Date()
    });

    await customer.save();

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reactivate customer
// @route   PATCH /api/customers/:id/reactivate
// @access  Private
exports.reactivateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Kunde nicht gefunden'
      });
    }

    customer.isActive = true;
    customer.auditLog.push({
      userId: req.user._id,
      action: 'reactivated',
      timestamp: new Date()
    });

    await customer.save();

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};
