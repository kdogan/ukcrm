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
    enum: ['created', 'updated', 'status_changed'],
    required: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed
  }
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
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  meterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meter',
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
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
    enum: ['draft', 'active', 'ended', 'archived'],
    default: 'active',
    index: true
  },
  notes: {
    type: String,
    maxlength: 2000
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  auditLog: [auditLogSchema]
}, {
  timestamps: true
});

// Compound Indizes
contractSchema.index({ beraterId: 1, status: 1, endDate: 1 });
contractSchema.index({ contractNumber: 1 });

// Auto-generate contract number
contractSchema.pre('save', async function(next) {
  if (this.isNew && !this.contractNumber) {
    const count = await mongoose.model('Contract').countDocuments();
    this.contractNumber = `V${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Berechne Enddatum automatisch
contractSchema.pre('save', function(next) {
  if (this.isModified('startDate') || this.isModified('durationMonths')) {
    const endDate = new Date(this.startDate);
    endDate.setMonth(endDate.getMonth() + this.durationMonths);
    this.endDate = endDate;
  }
  next();
});

// Virtuelles Feld für Restlaufzeit
contractSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = end - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

contractSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Contract', contractSchema);
