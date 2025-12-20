const express = require('express');
const router = express.Router();
const {
  getAvailablePackages,
  createUpgradeRequest,
  getMyUpgradeRequests,
  updatePaymentInfo,
  cancelUpgradeRequest,
  addPaymentMethod,
  getMyPaymentMethods,
  deletePaymentMethod
} = require('../controllers/upgradeController');
const { authenticate } = require('../middleware/auth');

// Alle Routes benötigen Authentifizierung
router.use(authenticate);

// Pakete
router.get('/packages', getAvailablePackages);

// Upgrade-Anfragen
router.post('/request', createUpgradeRequest);
router.get('/my-requests', getMyUpgradeRequests);
router.patch('/request/:id/payment', updatePaymentInfo);
router.delete('/request/:id', cancelUpgradeRequest);

// Zahlungsmethoden
router.route('/payment-methods')
  .get(getMyPaymentMethods)
  .post(addPaymentMethod);

router.delete('/payment-methods/:id', deletePaymentMethod);

module.exports = router;
