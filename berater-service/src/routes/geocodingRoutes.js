const express = require('express');
const router = express.Router();
const { searchAddress } = require('../controllers/geocodingController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/search', searchAddress);

module.exports = router;
