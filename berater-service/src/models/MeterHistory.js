const mongoose = require('mongoose');

const meterHistorySchema = new mongoose.Schema({
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
    required: true
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    default: null
  },
  startDate: {
    type: Date,
    required: [true, 'Startdatum ist erforderlich']
  },
  endDate: {
    type: Date,
    default: null // null = aktuell aktiv
  }
}, {
  timestamps: { 
    createdAt: true, 
    updatedAt: false // Historie darf nicht aktualisiert werden
  }
});

// Indizes
meterHistorySchema.index({ meterId: 1, endDate: 1 });
meterHistorySchema.index({ customerId: 1 });

// Verhindere Updates (nur Insert erlaubt)
meterHistorySchema.pre('save', function(next) {
  if (!this.isNew) {
    return next(new Error('Historische Einträge dürfen nicht geändert werden'));
  }
  next();
});

// Validierung: Keine Überlappungen
meterHistorySchema.pre('save', async function(next) {
  if (!this.isNew) return next();

  // Prüfe ob es bereits einen aktiven Eintrag gibt (endDate: null)
  const activeEntry = await mongoose.model('MeterHistory').findOne({
    meterId: this.meterId,
    _id: { $ne: this._id },
    endDate: null
  });

  if (activeEntry) {
    return next(new Error('Überlappende Zeiträume sind nicht erlaubt'));
  }

  // Prüfe auf Überlappungen mit abgeschlossenen Einträgen
  if (this.endDate) {
    const overlapping = await mongoose.model('MeterHistory').findOne({
      meterId: this.meterId,
      _id: { $ne: this._id },
      $or: [
        // Neue Periode startet während existierender Periode
        {
          startDate: { $lte: this.startDate },
          endDate: { $gte: this.startDate, $ne: null }
        },
        // Neue Periode endet während existierender Periode
        {
          startDate: { $lte: this.endDate },
          endDate: { $gte: this.endDate, $ne: null }
        },
        // Neue Periode umschließt existierende Periode
        {
          startDate: { $gte: this.startDate },
          endDate: { $lte: this.endDate, $ne: null }
        }
      ]
    });

    if (overlapping) {
      return next(new Error('Überlappende Zeiträume sind nicht erlaubt'));
    }
  }

  next();
});

module.exports = mongoose.model('MeterHistory', meterHistorySchema);
