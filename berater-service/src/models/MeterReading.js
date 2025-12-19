const mongoose = require('mongoose');

const meterReadingSchema = new mongoose.Schema({
  meterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meter',
    required: true,
    index: true
  },
  beraterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    default: null
  },
  readingValue: {
    type: Number,
    required: [true, 'Ablesewert ist erforderlich'],
    min: [0, 'Ablesewert muss positiv sein']
  },
  readingDate: {
    type: Date,
    required: [true, 'Ablesedatum ist erforderlich'],
    default: Date.now
  },
  readingType: {
    type: String,
    enum: ['initial', 'regular', 'final', 'special'],
    default: 'regular',
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notizen dürfen maximal 500 Zeichen lang sein']
  },
  imageUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indizes
meterReadingSchema.index({ meterId: 1, readingDate: -1 });
meterReadingSchema.index({ beraterId: 1, readingDate: -1 });
meterReadingSchema.index({ customerId: 1, readingDate: -1 });

// Validierung: Ablesewert darf nicht kleiner als vorheriger Wert sein
meterReadingSchema.pre('save', async function(next) {
  if (!this.isNew) return next();

  const lastReading = await mongoose.model('MeterReading').findOne({
    meterId: this.meterId,
    readingDate: { $lt: this.readingDate }
  }).sort({ readingDate: -1 });

  if (lastReading && this.readingValue < lastReading.readingValue) {
    return next(new Error(`Ablesewert (${this.readingValue}) darf nicht kleiner als der letzte Ablesewert (${lastReading.readingValue}) sein`));
  }

  next();
});

// Virtuelles Feld für Verbrauch
meterReadingSchema.virtual('consumption').get(function() {
  // Wird auf Anwendungsebene berechnet
  return 0;
});

meterReadingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('MeterReading', meterReadingSchema);
