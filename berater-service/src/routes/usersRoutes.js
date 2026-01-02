const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { loadUsers, updateMasterBerater } = require('../controllers/usersController');

// Auth Middleware
router.use(authenticate);

// GET /api/users -> liste für Chat
router.get('/', loadUsers);

// PATCH /api/users/master-berater -> Master Berater aktualisieren
router.patch('/master-berater', updateMasterBerater);

module.exports = router;
