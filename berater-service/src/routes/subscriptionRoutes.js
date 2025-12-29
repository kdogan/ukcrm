const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');

// Alle Routen erfordern Authentifizierung
router.use(authenticate);

/**
 * @route GET /api/subscription/my-subscription
 * @desc Gibt die Subscription-Informationen des aktuellen Benutzers zurück
 * @access Private (Berater, Admin, Superadmin)
 */
router.get('/my-subscription', subscriptionController.getMySubscription);

/**
 * @route GET /api/subscription/expiring
 * @desc Gibt alle Benutzer mit ablaufenden Paketen zurück
 * @access Private (nur Superadmin)
 */
router.get('/expiring', subscriptionController.getExpiringSubscriptions);

/**
 * @route POST /api/subscription/downgrade-expired
 * @desc Setzt alle abgelaufenen Pakete auf "free" zurück
 * @access Private (nur Superadmin)
 */
router.post('/downgrade-expired', subscriptionController.downgradeExpiredSubscriptions);

module.exports = router;
