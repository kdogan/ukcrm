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
    trim: true
  },
  type: {
    type: String,
    enum: ['electricity', 'gas', 'water', 'heatpump', 'nightstorage'],
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

  /**
   * Aktueller Kunde (NULL = frei)
   * → NICHT historisch, nur aktueller Status
   */
  currentCustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
    index: true
  },
  maloId: {
    type: String,
    trim: true
  },
  isTwoTariff: {
    type: Boolean,
    default: false,
    comment: 'Zwei-Tarif-Zähler (HT/NT) - z.B. für Tag/Nacht-Stromzähler'
  }
}, {
  timestamps: true
});


// ✅ WICHTIG: Compound Unique Index
// Ein Zähler ist NUR pro Berater eindeutig
meterSchema.index(
  { beraterId: 1, meterNumber: 1 },
  { unique: true }
);

// Weitere Indizes
meterSchema.index({ beraterId: 1, currentCustomerId: 1 });

// Virtuelles Feld für Status
meterSchema.virtual('isFree').get(function() {
  return this.currentCustomerId === null;
});

meterSchema.set('toJSON', { virtuals: true });
meterSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Meter', meterSchema);
