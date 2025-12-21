const ContractCounter = require('../models/ContractCounter');

async function getNextContractNumber() {
  const year = new Date().getFullYear();

  const counter = await ContractCounter.findOneAndUpdate(
    { name: `contract-${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `V-${year}-${String(counter.seq).padStart(3, '0')}`;
}

module.exports = getNextContractNumber;