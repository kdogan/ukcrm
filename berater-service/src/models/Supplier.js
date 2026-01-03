const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name ist erforderlich'],
    unique: true,
    trim: true
  },
  shortName: {
    type: String,
    required: [true, 'Kurzbezeichnung ist erforderlich'],
    trim: true
  },
  beraterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'Deutschland'
    }
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Bitte gültige E-Mail eingeben']
  },
  contactPhone: {
    type: String,
    trim: true
  },
  logoUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index (name has unique: true, so no need for explicit index)
supplierSchema.index({ isActive: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
