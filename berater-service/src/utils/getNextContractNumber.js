const ContractCounter = require('../models/ContractCounter');
const Contract = require('../models/Contract');

async function getNextContractNumber(beraterId, session = null) {
  const year = new Date().getFullYear();
  const maxRetries = 10;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Hole und inkrementiere Counter (mit session wenn vorhanden)
    const counter = await ContractCounter.findOneAndUpdate(
      { name: `contract-${year}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session }
    );

    const contractNumber = `V-${year}-${String(counter.seq).padStart(3, '0')}`;

    // Prüfe ob diese Nummer bereits existiert (mit session wenn vorhanden)
    const exists = await Contract.findOne({ contractNumber }).session(session);

    if (!exists) {
      return contractNumber;
    }

    console.log(`Contract number ${contractNumber} already exists, retrying... (${attempt + 1}/${maxRetries})`);
  }

  // Fallback: Verwende Timestamp für Eindeutigkeit
  const timestamp = Date.now();
  return `V-${year}-${timestamp}`;
}

module.exports = getNextContractNumber;