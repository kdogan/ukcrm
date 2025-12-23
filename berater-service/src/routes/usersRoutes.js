const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { loadUsers } = require('../controllers/usersController');

// Auth Middleware
router.use(authenticate);

// GET /api/users -> liste für Chat
router.get('/', loadUsers);

module.exports = router;
