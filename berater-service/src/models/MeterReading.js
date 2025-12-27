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
    min: [0, 'Ablesewert muss positiv sein']
  },
  // HT (Hochtarif) und NT (Niedrigtarif) für Zwei-Tarif-Zähler
  readingValueHT: {
    type: Number,
    min: [0, 'HT-Wert muss positiv sein']
  },
  readingValueNT: {
    type: Number,
    min: [0, 'NT-Wert muss positiv sein']
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

// Validierung: Entweder readingValue ODER HT-Wert (NT ist optional) müssen vorhanden sein
meterReadingSchema.pre('save', async function(next) {
  // Prüfe ob entweder readingValue oder HT-Wert vorhanden ist
  const hasReadingValue = this.readingValue != null;
  const hasHT = this.readingValueHT != null;
  const hasNT = this.readingValueNT != null;

  if (!hasReadingValue && !hasHT) {
    return next(new Error('Entweder Ablesewert oder HT-Wert muss angegeben werden'));
  }

  if (hasReadingValue && hasHT) {
    return next(new Error('Bitte nur entweder Ablesewert ODER HT/NT-Werte angeben, nicht beides'));
  }

  // NT darf nicht ohne HT angegeben werden
  if (hasNT && !hasHT) {
    return next(new Error('NT-Wert kann nicht ohne HT-Wert angegeben werden'));
  }

  if (!this.isNew) return next();

  // Validierung: Ablesewert darf nicht kleiner als vorheriger Wert sein
  const lastReading = await mongoose.model('MeterReading').findOne({
    meterId: this.meterId,
    readingDate: { $lt: this.readingDate }
  }).sort({ readingDate: -1 });

  if (lastReading) {
    // Prüfe Ein-Tarif-Zähler
    if (hasReadingValue && lastReading.readingValue != null) {
      if (this.readingValue < lastReading.readingValue) {
        return next(new Error(`Ablesewert (${this.readingValue}) darf nicht kleiner als der letzte Ablesewert (${lastReading.readingValue}) sein`));
      }
    }

    // Prüfe Zwei-Tarif-Zähler (HT/NT)
    if (hasHT && lastReading.readingValueHT != null) {
      if (this.readingValueHT < lastReading.readingValueHT) {
        return next(new Error(`HT-Wert (${this.readingValueHT}) darf nicht kleiner als der letzte HT-Wert (${lastReading.readingValueHT}) sein`));
      }
      // Prüfe NT nur wenn beide Werte (aktuell und vorherig) vorhanden sind
      if (hasNT && lastReading.readingValueNT != null) {
        if (this.readingValueNT < lastReading.readingValueNT) {
          return next(new Error(`NT-Wert (${this.readingValueNT}) darf nicht kleiner als der letzte NT-Wert (${lastReading.readingValueNT}) sein`));
        }
      }
    }
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
