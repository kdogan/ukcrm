const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  beraterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  reminderType: {
    type: String,
    enum: ['90days', '60days', '30days'],
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'done', 'ignored'],
    default: 'open',
    index: true
  },
  note: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound Index
reminderSchema.index({ beraterId: 1, status: 1, dueDate: 1 });

// Verhindere Duplikate
reminderSchema.index({ contractId: 1, reminderType: 1 }, { unique: true });

module.exports = mongoose.model('Reminder', reminderSchema);
