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

// Index
supplierSchema.index({ name: 1 });
supplierSchema.index({ isActive: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
