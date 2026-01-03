const mongoose = require('mongoose');

const ContractCounterSchema = new mongoose.Schema({
  /**
   * Beispiel:
   * contract-<beraterId>-<year>
   * contract-665fd9...-2026
   */
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  seq: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ContractCounter', ContractCounterSchema);