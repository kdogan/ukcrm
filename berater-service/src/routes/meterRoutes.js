const express = require('express');
const router = express.Router();
const {
  getMeters,
  getMeter,
  getMeterHistory,
  createMeter,
  assignMeter,
  updateMeter,
  getMeterReadings,
  createMeterReading,
  getLatestMeterReading,
  getYearlyConsumptionEstimates,
  deleteMeterReading,
  deleteMeter
} = require('../controllers/meterController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.route('/')
  .get(getMeters)
  .post(createMeter);

router.route('/:id')
  .get(getMeter)
  .put(updateMeter)
  .delete(deleteMeter);

router.get('/:id/history', getMeterHistory);
router.post('/:id/assign', assignMeter);

// Meter reading routes
router.get('/:id/readings/latest', getLatestMeterReading);
router.get('/:id/readings/yearly-estimates', getYearlyConsumptionEstimates);
router.route('/:id/readings')
  .get(getMeterReadings)
  .post(createMeterReading);
router.delete('/:id/readings/:readingId', deleteMeterReading);

module.exports = router;
