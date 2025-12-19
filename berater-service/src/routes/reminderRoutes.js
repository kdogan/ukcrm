const express = require('express');
const router = express.Router();
const {
  getReminders,
  markReminderDone,
  ignoreReminder,
  getDashboardStats
} = require('../controllers/reminderController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getReminders);
router.patch('/:id/done', markReminderDone);
router.patch('/:id/ignore', ignoreReminder);
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;
