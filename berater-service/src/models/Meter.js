const mongoose = require('mongoose');

const meterSchema = new mongoose.Schema({
  beraterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  meterNumber: {
    type: String,
    required: [true, 'Zählernummer ist erforderlich'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['electricity', 'gas', 'water', 'heat'],
    required: [true, 'Zählertyp ist erforderlich']
  },
  location: {
    street: String,
    zip: String,
    city: String
  },
  manufacturer: {
    type: String,
    trim: true
  },
  yearBuilt: {
    type: Number,
    min: 1950,
    max: new Date().getFullYear()
  },
  currentCustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  maloId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indizes
meterSchema.index({ meterNumber: 1 });
meterSchema.index({ beraterId: 1, currentCustomerId: 1 });

// Virtuelles Feld für Status
meterSchema.virtual('isFree').get(function() {
  return this.currentCustomerId === null;
});

// Virtuelles Feld für aktuellen Ablesewert (wird auf Anwendungsebene gesetzt)
meterSchema.virtual('currentReading');

// Virtuelles Feld für letzte Ablesung (wird auf Anwendungsebene gesetzt)
meterSchema.virtual('lastReadingDate');

meterSchema.set('toJSON', { virtuals: true });
meterSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Meter', meterSchema);
