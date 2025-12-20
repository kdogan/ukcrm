const mongoose = require('mongoose');

const packageUpgradeRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentPackage: {
    type: String,
    enum: ['free', 'basic', 'professional', 'enterprise'],
    required: true
  },
  requestedPackage: {
    type: String,
    enum: ['free', 'basic', 'professional', 'enterprise'],
    required: true
  },
  packageDetails: {
    name: String,
    displayName: String,
    price: Number,
    currency: String,
    billingPeriod: String,
    maxCustomers: Number,
    maxContracts: Number,
    maxMeters: Number
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod'
  },
  paymentDetails: {
    method: {
      type: String,
      enum: ['bankTransfer', 'creditCard', 'paypal', 'sepa']
    },
    transactionId: String,
    amount: Number,
    currency: String,
    paymentDate: Date,
    paymentProof: String // URL zum Zahlungsnachweis (z.B. Screenshot)
  },
  status: {
    type: String,
    enum: ['pending', 'payment_received', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  // Admin-Felder
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indizes für schnellere Abfragen
packageUpgradeRequestSchema.index({ user: 1 });
packageUpgradeRequestSchema.index({ status: 1 });
packageUpgradeRequestSchema.index({ createdAt: -1 });

// Verhindere mehrere pending Requests für denselben User
packageUpgradeRequestSchema.index(
  { user: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' }
  }
);

module.exports = mongoose.model('PackageUpgradeRequest', packageUpgradeRequestSchema);
