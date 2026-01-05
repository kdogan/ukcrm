const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  loadUsers,
  updateMasterBerater,
  generateShareToken,
  connectByToken,
  disconnectMasterBerater,
  getShareStatus
} = require('../controllers/usersController');

// Auth Middleware
router.use(authenticate);

// GET /api/users -> liste für Chat
router.get('/', loadUsers);

// PATCH /api/users/master-berater -> Master Berater aktualisieren (Legacy)
router.patch('/master-berater', updateMasterBerater);

// GET /api/users/share-status -> Share-Token und Master Berater Status
router.get('/share-status', getShareStatus);

// POST /api/users/generate-token -> Share-Token generieren (nur Master Berater)
router.post('/generate-token', generateShareToken);

// POST /api/users/connect-by-token -> Mit Master Berater per Token verbinden
router.post('/connect-by-token', connectByToken);

// POST /api/users/disconnect-master -> Verbindung zum Master Berater trennen
router.post('/disconnect-master', disconnectMasterBerater);

module.exports = router;
