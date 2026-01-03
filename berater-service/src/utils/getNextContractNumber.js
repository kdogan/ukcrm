const ContractCounter = require('../models/ContractCounter');
const Contract = require('../models/Contract');

async function getNextContractNumber(beraterId, session = null) {
  const year = new Date().getFullYear();
  const counterName = `contract-${beraterId}-${year}`;

  // 1️⃣ Prüfe ob Counter existiert
  let query = ContractCounter.findOne({ name: counterName });
  if (session) {
    query = query.session(session);
  }
  let counter = await query;

  // 2️⃣ Falls nicht: initialisieren anhand bestehender Verträge
  if (!counter) {
    const regex = new RegExp(`^V-${year}-(\\d+)$`);

    let contractQuery = Contract.findOne({
      beraterId,
      contractNumber: { $regex: regex }
    }).sort({ contractNumber: -1 });

    if (session) {
      contractQuery = contractQuery.session(session);
    }

    const lastContract = await contractQuery;

    let startSeq = 0;

    if (lastContract) {
      const match = lastContract.contractNumber.match(regex);
      if (match) {
        startSeq = parseInt(match[1], 10);
      }
    }

    counter = await ContractCounter.create([{
      name: counterName,
      seq: startSeq
    }], { session }).then(res => res[0]);
  }

  // 3️⃣ Jetzt atomar inkrementieren
  counter = await ContractCounter.findOneAndUpdate(
    { name: counterName },
    { $inc: { seq: 1 } },
    { new: true, session }
  );

  return `V-${year}-${String(counter.seq).padStart(4, '0')}`;
}

module.exports = getNextContractNumber;
