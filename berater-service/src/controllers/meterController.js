const Meter = require('../models/Meter');
const MeterHistory = require('../models/MeterHistory');

// @desc    Get all meters
// @route   GET /api/meters
// @access  Private
exports.getMeters = async (req, res, next) => {
  try {
    const { type, isFree, search, page = 1, limit = 20 } = req.query;

    const filter = { beraterId: req.user._id };
    
    if (type) filter.type = type;
    if (isFree !== undefined) {
      filter.currentCustomerId = isFree === 'true' ? null : { $ne: null };
    }
    if (search) {
      filter.meterNumber = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const total = await Meter.countDocuments(filter);

    const meters = await Meter.find(filter)
      .populate('currentCustomerId', 'firstName lastName customerNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      data: meters,
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

// @desc    Get single meter
// @route   GET /api/meters/:id
// @access  Private
exports.getMeter = async (req, res, next) => {
  try {
    const meter = await Meter.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    }).populate('currentCustomerId', 'firstName lastName customerNumber');

    if (!meter) {
      return res.status(404).json({
        success: false,
        message: 'Zähler nicht gefunden'
      });
    }

    res.status(200).json({
      success: true,
      data: meter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meter history
// @route   GET /api/meters/:id/history
// @access  Private
exports.getMeterHistory = async (req, res, next) => {
  try {
    // Prüfe ob Zähler dem Berater gehört
    const meter = await Meter.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!meter) {
      return res.status(404).json({
        success: false,
        message: 'Zähler nicht gefunden'
      });
    }

    const history = await MeterHistory.find({ meterId: req.params.id })
      .populate('customerId', 'firstName lastName customerNumber')
      .populate('contractId', 'contractNumber startDate endDate')
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create meter
// @route   POST /api/meters
// @access  Private
exports.createMeter = async (req, res, next) => {
  try {
    const meterData = {
      ...req.body,
      beraterId: req.user._id
    };

    const meter = await Meter.create(meterData);

    res.status(201).json({
      success: true,
      data: meter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign meter to customer
// @route   POST /api/meters/:id/assign
// @access  Private
exports.assignMeter = async (req, res, next) => {
  try {
    const { customerId, startDate, contractId } = req.body;

    if (!customerId || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Kunde und Startdatum sind erforderlich'
      });
    }

    const meter = await Meter.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!meter) {
      return res.status(404).json({
        success: false,
        message: 'Zähler nicht gefunden'
      });
    }

    // Wenn Zähler bereits zugeordnet ist, beende aktuelle Zuordnung
    if (meter.currentCustomerId) {
      const currentHistory = await MeterHistory.findOne({
        meterId: meter._id,
        endDate: null
      });

      if (currentHistory) {
        const yesterday = new Date(startDate);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Update nicht erlaubt, daher neuen Eintrag mit endDate
        await MeterHistory.findByIdAndUpdate(currentHistory._id, {
          endDate: yesterday
        });
      }
    }

    // Neue Zuordnung in Historie
    await MeterHistory.create({
      meterId: meter._id,
      beraterId: req.user._id,
      customerId,
      contractId: contractId || null,
      startDate: new Date(startDate),
      endDate: null
    });

    // Update Meter
    meter.currentCustomerId = customerId;
    await meter.save();

    const updatedMeter = await Meter.findById(meter._id)
      .populate('currentCustomerId', 'firstName lastName customerNumber');

    res.status(200).json({
      success: true,
      data: updatedMeter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meter
// @route   PUT /api/meters/:id
// @access  Private
exports.updateMeter = async (req, res, next) => {
  try {
    const meter = await Meter.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!meter) {
      return res.status(404).json({
        success: false,
        message: 'Zähler nicht gefunden'
      });
    }

    // Erlaubte Felder
    const allowedFields = ['type', 'location', 'manufacturer', 'yearBuilt'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        meter[field] = req.body[field];
      }
    });

    await meter.save();

    res.status(200).json({
      success: true,
      data: meter
    });
  } catch (error) {
    next(error);
  }
};
