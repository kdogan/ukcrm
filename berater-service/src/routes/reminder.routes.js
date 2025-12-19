const express = require('express');
const router = express.Router();
const Reminder = require('../models/reminder.model');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// GET /api/reminders
router.get('/', async (req, res, next) => {
  try {
    const { status = 'open' } = req.query;
    
    const reminders = await Reminder.find({
      beraterId: req.user._id,
      status
    })
      .populate({
        path: 'contractId',
        populate: [
          { path: 'customerId', select: 'firstName lastName' },
          { path: 'supplierId', select: 'name' }
        ]
      })
      .sort({ dueDate: 1 });

    res.json({ success: true, data: reminders });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/reminders/:id/done
router.patch('/:id/done', async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, beraterId: req.user._id },
      { status: 'done', note: req.body.note },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Erinnerung nicht gefunden' });
    }

    res.json({ success: true, data: reminder });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
