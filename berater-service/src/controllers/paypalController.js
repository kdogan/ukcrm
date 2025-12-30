const paypalService = require('../services/paypalService');
const Package = require('../models/Package');
const User = require('../models/User');

/**
 * Create PayPal Order for package purchase
 */
exports.createPayPalOrder = async (req, res) => {
  try {
    console.log('🟡 PayPal createOrder called');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user._id);

    const { packageName, billingInterval } = req.body;
    const userId = req.user._id;

    // Validate billing interval
    if (!billingInterval || !['monthly', 'yearly'].includes(billingInterval)) {
      return res.status(400).json({
        success: false,
        message: 'Bitte wählen Sie ein Zahlungsintervall (monthly oder yearly)'
      });
    }

    // Get package details
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

    // Calculate price based on billing interval
    const amount = targetPackage.calculatePrice(billingInterval);
    const currency = targetPackage.currency || 'EUR';

    // Create PayPal order
    const orderData = {
      packageName: targetPackage.name, // Store actual package name, not displayName
      packageDisplayName: targetPackage.displayName, // For PayPal description
      billingInterval: billingInterval,
      amount: amount,
      currency: currency,
      userId: userId.toString()
    };

    console.log('Creating PayPal order with data:', orderData);
    const paypalOrder = await paypalService.createOrder(orderData);
    console.log('PayPal order result:', paypalOrder);

    if (!paypalOrder.success) {
      return res.status(500).json({
        success: false,
        message: 'Fehler beim Erstellen der PayPal-Bestellung',
        error: paypalOrder.error
      });
    }

    res.json({
      success: true,
      orderId: paypalOrder.orderId,
      approvalUrl: paypalOrder.approvalUrl,
      message: 'PayPal-Bestellung erfolgreich erstellt'
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Erstellen der PayPal-Bestellung',
      error: error.message
    });
  }
};

/**
 * Capture PayPal Order and activate subscription
 */
exports.capturePayPalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID ist erforderlich'
      });
    }

    // Capture the PayPal order
    const captureResult = await paypalService.captureOrder(orderId);

    if (!captureResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Fehler beim Abschließen der PayPal-Zahlung',
        error: captureResult.error
      });
    }

    // Extract order data
    const { packageName, billingInterval } = captureResult.orderData;

    if (!packageName || !billingInterval) {
      return res.status(400).json({
        success: false,
        message: 'Ungültige Bestelldaten'
      });
    }

    // Get package details
    const targetPackage = await Package.findOne({ name: packageName });

    if (!targetPackage) {
      return res.status(404).json({
        success: false,
        message: 'Paket nicht gefunden'
      });
    }

    // Calculate subscription dates
    const now = new Date();
    const endDate = new Date(now);
    if (billingInterval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Update user's package and subscription
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        package: targetPackage.name,
        packageLimits: {
          maxCustomers: targetPackage.maxCustomers,
          maxContracts: targetPackage.maxContracts,
          maxMeters: targetPackage.maxMeters
        },
        subscription: {
          billingInterval: billingInterval,
          startDate: now,
          endDate: endDate,
          lastPaymentDate: now,
          nextPaymentDate: endDate,
          autoRenew: true,
          status: 'active',
          paymentMethod: 'paypal',
          paypalSubscriptionId: orderId,
          lastTransactionId: captureResult.transactionId
        }
      },
      { new: true }
    ).select('-passwordHash');

    const price = targetPackage.calculatePrice(billingInterval);
    const savings = billingInterval === 'yearly' ? targetPackage.yearlySavings : 0;

    res.json({
      success: true,
      message: `${targetPackage.displayName} erfolgreich gekauft`,
      data: updatedUser,
      subscription: {
        package: targetPackage.displayName,
        billingInterval: billingInterval,
        billingIntervalText: billingInterval === 'yearly' ? 'Jährlich' : 'Monatlich',
        price: price,
        savings: savings,
        startDate: now,
        endDate: endDate,
        transactionId: captureResult.transactionId
      }
    });
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abschließen der Zahlung',
      error: error.message
    });
  }
};

/**
 * Get PayPal Order Details
 */
exports.getPayPalOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderDetails = await paypalService.getOrderDetails(orderId);

    if (!orderDetails.success) {
      return res.status(500).json({
        success: false,
        message: 'Fehler beim Abrufen der Bestelldetails',
        error: orderDetails.error
      });
    }

    res.json({
      success: true,
      order: orderDetails.order
    });
  } catch (error) {
    console.error('Error getting PayPal order details:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Bestelldetails',
      error: error.message
    });
  }
};
