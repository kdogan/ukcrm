const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'deactivated', 'reactivated'],
    required: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed
  }
}, { _id: false });

const customerSchema = new mongoose.Schema({
  beraterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  anrede: {
    type: String,
    enum: ['Herr', 'Frau'],
    trim: true
  },
  firstName: {
    type: String,
    required: [true, 'Vorname ist erforderlich'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Nachname ist erforderlich'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Bitte gültige E-Mail eingeben']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    zip: String,
    city: String,
    country: { type: String, default: 'Deutschland' }
  },
  dateOfBirth: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 2000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  auditLog: [auditLogSchema]
}, {
  timestamps: true
});

// Compound Index für Berater und Status
customerSchema.index({ beraterId: 1, isActive: 1 });
// customerNumber has unique: true, so no need for explicit index

// Auto-generate customer number
customerSchema.pre('save', async function(next) {
  if (this.isNew && !this.customerNumber) {
    const count = await mongoose.model('Customer').countDocuments();
    this.customerNumber = `K${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtuelle Felder
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// JSON Output mit virtuals
customerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Customer', customerSchema);
