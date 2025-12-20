const User = require('../models/User');
const Package = require('../models/Package');
const PackageUpgradeRequest = require('../models/PackageUpgradeRequest');
const PaymentMethod = require('../models/PaymentMethod');

// @desc    Verfügbare Pakete abrufen
// @route   GET /api/upgrade/packages
// @access  Private
exports.getAvailablePackages = async (req, res, next) => {
  try {
    const packages = await Package.find({ isActive: true })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: packages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upgrade-Anfrage erstellen
// @route   POST /api/upgrade/request
// @access  Private
exports.createUpgradeRequest = async (req, res, next) => {
  try {
    const { requestedPackage, paymentMethodId, paymentDetails } = req.body;

    // Validierung
    if (!requestedPackage) {
      return res.status(400).json({
        success: false,
        message: 'Paket-Auswahl ist erforderlich'
      });
    }

    // Prüfe ob User bereits eine pending Anfrage hat
    const existingRequest = await PackageUpgradeRequest.findOne({
      user: req.user._id,
      status: { $in: ['pending', 'payment_received'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Sie haben bereits eine offene Upgrade-Anfrage'
      });
    }

    // Paket-Details holen
    const packageDetails = await Package.findOne({ name: requestedPackage });
    if (!packageDetails) {
      return res.status(404).json({
        success: false,
        message: 'Paket nicht gefunden'
      });
    }

    // Prüfe ob Upgrade sinnvoll ist
    if (req.user.package === requestedPackage) {
      return res.status(400).json({
        success: false,
        message: 'Sie haben bereits dieses Paket'
      });
    }

    // Payment Method validieren falls angegeben
    let paymentMethod = null;
    if (paymentMethodId) {
      paymentMethod = await PaymentMethod.findOne({
        _id: paymentMethodId,
        user: req.user._id,
        isActive: true
      });

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Zahlungsmethode nicht gefunden'
        });
      }
    }

    // Upgrade-Anfrage erstellen
    const upgradeRequest = await PackageUpgradeRequest.create({
      user: req.user._id,
      currentPackage: req.user.package,
      requestedPackage,
      packageDetails: {
        name: packageDetails.name,
        displayName: packageDetails.displayName,
        price: packageDetails.price,
        currency: packageDetails.currency,
        billingPeriod: packageDetails.billingPeriod,
        maxCustomers: packageDetails.maxCustomers,
        maxContracts: packageDetails.maxContracts,
        maxMeters: packageDetails.maxMeters
      },
      paymentMethod: paymentMethodId || null,
      paymentDetails: paymentDetails || {},
      status: 'pending'
    });

    // Request mit populated Feldern zurückgeben
    const populatedRequest = await PackageUpgradeRequest.findById(upgradeRequest._id)
      .populate('user', 'email firstName lastName')
      .populate('paymentMethod');

    res.status(201).json({
      success: true,
      message: 'Upgrade-Anfrage erfolgreich erstellt',
      data: populatedRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eigene Upgrade-Anfragen abrufen
// @route   GET /api/upgrade/my-requests
// @access  Private
exports.getMyUpgradeRequests = async (req, res, next) => {
  try {
    const requests = await PackageUpgradeRequest.find({ user: req.user._id })
      .populate('paymentMethod')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Zahlungsnachweis hochladen/aktualisieren
// @route   PATCH /api/upgrade/request/:id/payment
// @access  Private
exports.updatePaymentInfo = async (req, res, next) => {
  try {
    const { transactionId, paymentProof, paymentDate, amount } = req.body;

    const request = await PackageUpgradeRequest.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Upgrade-Anfrage nicht gefunden'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Anfrage kann nicht mehr bearbeitet werden'
      });
    }

    // Zahlungsdetails aktualisieren
    request.paymentDetails = {
      ...request.paymentDetails,
      transactionId: transactionId || request.paymentDetails.transactionId,
      paymentProof: paymentProof || request.paymentDetails.paymentProof,
      paymentDate: paymentDate || request.paymentDetails.paymentDate,
      amount: amount || request.paymentDetails.amount
    };
    request.status = 'payment_received';

    await request.save();

    res.status(200).json({
      success: true,
      message: 'Zahlungsinformationen aktualisiert',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upgrade-Anfrage stornieren
// @route   DELETE /api/upgrade/request/:id
// @access  Private
exports.cancelUpgradeRequest = async (req, res, next) => {
  try {
    const request = await PackageUpgradeRequest.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Upgrade-Anfrage nicht gefunden'
      });
    }

    if (request.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Genehmigte Anfragen können nicht storniert werden'
      });
    }

    request.status = 'cancelled';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Upgrade-Anfrage storniert'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Zahlungsmethode hinzufügen
// @route   POST /api/upgrade/payment-methods
// @access  Private
exports.addPaymentMethod = async (req, res, next) => {
  try {
    const { type, bankDetails, cardDetails, paypalEmail, isDefault } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Zahlungsmethoden-Typ ist erforderlich'
      });
    }

    // Wenn isDefault true ist, alle anderen auf false setzen
    if (isDefault) {
      await PaymentMethod.updateMany(
        { user: req.user._id },
        { isDefault: false }
      );
    }

    const paymentMethod = await PaymentMethod.create({
      user: req.user._id,
      type,
      bankDetails: type === 'bankTransfer' || type === 'sepa' ? bankDetails : undefined,
      cardDetails: type === 'creditCard' ? cardDetails : undefined,
      paypalEmail: type === 'paypal' ? paypalEmail : undefined,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      message: 'Zahlungsmethode hinzugefügt',
      data: paymentMethod
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eigene Zahlungsmethoden abrufen
// @route   GET /api/upgrade/payment-methods
// @access  Private
exports.getMyPaymentMethods = async (req, res, next) => {
  try {
    const paymentMethods = await PaymentMethod.find({
      user: req.user._id,
      isActive: true
    }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Zahlungsmethode löschen
// @route   DELETE /api/upgrade/payment-methods/:id
// @access  Private
exports.deletePaymentMethod = async (req, res, next) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Zahlungsmethode nicht gefunden'
      });
    }

    paymentMethod.isActive = false;
    await paymentMethod.save();

    res.status(200).json({
      success: true,
      message: 'Zahlungsmethode gelöscht'
    });
  } catch (error) {
    next(error);
  }
};
