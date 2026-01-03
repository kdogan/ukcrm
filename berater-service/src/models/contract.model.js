const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  changes: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

const contractSchema = new mongoose.Schema({
  beraterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  contractNumber: {
    type: String,
    required: [true, 'Vertragsnummer ist erforderlich'],
    trim: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Kunde ist erforderlich']
  },
  meterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meter',
    required: [true, 'Zähler ist erforderlich']
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Anbieter ist erforderlich']
  },
  startDate: {
    type: Date,
    required: [true, 'Startdatum ist erforderlich']
  },
  durationMonths: {
    type: Number,
    required: [true, 'Laufzeit ist erforderlich'],
    min: 1,
    max: 120
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'archived', 'draft'],
    default: 'active',
    index: true
  },
  notes: {
    type: String,
    maxlength: 2000
  },
  auditLog: [auditLogSchema]
}, {
  timestamps: true
});

// Compound Index für unique contractNumber pro Berater
contractSchema.index({ beraterId: 1, contractNumber: 1 }, { unique: true });

// Compound Indizes für Performance
contractSchema.index({ beraterId: 1, status: 1, endDate: 1 });
contractSchema.index({ customerId: 1 });
contractSchema.index({ meterId: 1 });
contractSchema.index({ supplierId: 1 });

// Auto-Calculate endDate
contractSchema.pre('save', function(next) {
  if (this.isModified('startDate') || this.isModified('durationMonths')) {
    const start = new Date(this.startDate);
    this.endDate = new Date(start.setMonth(start.getMonth() + this.durationMonths));
  }
  next();
});

// Auto-Generate Contract Number
contractSchema.pre('save', async function(next) {
  if (this.isNew && !this.contractNumber) {
    const count = await mongoose.model('Contract').countDocuments();
    this.contractNumber = `CON${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual für Restlaufzeit in Tagen
contractSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Audit Log Helper
contractSchema.methods.addAuditLog = function(userId, action, changes = {}) {
  this.auditLog.push({ userId, action, changes });
};

module.exports = mongoose.model('Contract', contractSchema);
