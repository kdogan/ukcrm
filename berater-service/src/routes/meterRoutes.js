const express = require('express');
const router = express.Router();
const {
  getMeters,
  getMeter,
  getMeterHistory,
  createMeter,
  assignMeter,
  updateMeter
} = require('../controllers/meterController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.route('/')
  .get(getMeters)
  .post(createMeter);

router.route('/:id')
  .get(getMeter)
  .put(updateMeter);

router.get('/:id/history', getMeterHistory);
router.post('/:id/assign', assignMeter);

module.exports = router;
