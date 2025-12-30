const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/paypalController');
const { authenticate } = require('../middleware/auth');

// All PayPal routes require authentication
router.use(authenticate);

// Create PayPal order for package purchase
router.post('/create-order', paypalController.createPayPalOrder);

// Capture PayPal order after user approval
router.post('/capture-order', paypalController.capturePayPalOrder);

// Get PayPal order details
router.get('/order/:orderId', paypalController.getPayPalOrderDetails);

module.exports = router;
