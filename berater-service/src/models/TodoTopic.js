const mongoose = require('mongoose');

const todoTopicSchema = new mongoose.Schema({
  beraterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Thema-Name ist erforderlich'],
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Unique constraint: Ein Berater kann nicht zwei Topics mit gleichem Namen haben
todoTopicSchema.index({ beraterId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('TodoTopic', todoTopicSchema);
