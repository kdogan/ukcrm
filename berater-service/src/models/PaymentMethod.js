const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['bankTransfer', 'creditCard', 'paypal', 'sepa'],
    required: true
  },
  // Für Banküberweisung
  bankDetails: {
    accountHolder: String,
    iban: String,
    bic: String,
    bankName: String
  },
  // Für Kreditkarte (Hinweis: In Produktion nie vollständige Kartendaten speichern!)
  cardDetails: {
    lastFourDigits: String,
    cardType: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  // Für PayPal
  paypalEmail: String,
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index für schnellere Abfragen
paymentMethodSchema.index({ user: 1 });
paymentMethodSchema.index({ isDefault: 1 });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
