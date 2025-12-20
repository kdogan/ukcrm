const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  maxContracts: {
    type: Number,
    required: true,
    default: 10
  },
  maxCustomers: {
    type: Number,
    required: true,
    default: 10
  },
  maxMeters: {
    type: Number,
    required: true,
    default: 10
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  billingPeriod: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFree: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  features: [{
    name: String,
    enabled: Boolean
  }]
}, {
  timestamps: true
});

// Index für schnellere Abfragen
packageSchema.index({ name: 1 });
packageSchema.index({ isActive: 1 });

module.exports = mongoose.model('Package', packageSchema);
