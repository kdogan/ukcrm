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
  monthlyPrice: {
    type: Number,
    required: true,
    default: 0,
    comment: 'Monatlicher Preis - wird vom Superadmin definiert'
  },
  currency: {
    type: String,
    default: 'EUR'
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

// Virtuelle Felder für Preisberechnung
packageSchema.virtual('yearlyPrice').get(function() {
  // Jährlicher Preis: 10 Monate bezahlen statt 12 (2 Monate gratis)
  return this.monthlyPrice * 10;
});

packageSchema.virtual('yearlySavings').get(function() {
  // Ersparnis bei jährlicher Zahlung
  return this.monthlyPrice * 2;
});

// Methode zum Berechnen des Preises basierend auf Zahlungsintervall
packageSchema.methods.calculatePrice = function(billingInterval) {
  if (billingInterval === 'yearly') {
    return this.monthlyPrice * 10; // 2 Monate gratis
  }
  return this.monthlyPrice; // monatlich
};

// JSON-Ausgabe mit virtuellen Feldern
packageSchema.set('toJSON', { virtuals: true });
packageSchema.set('toObject', { virtuals: true });

// Index für schnellere Abfragen
packageSchema.index({ name: 1 });
packageSchema.index({ isActive: 1 });

module.exports = mongoose.model('Package', packageSchema);
