const Contract = require('../models/Contract');
const Todo = require('../models/Todo');
const getNextContractNumber = require('../utils/getNextContractNumber');

// @desc    Get all contracts
// @route   GET /api/contracts
// @access  Private
exports.getContracts = async (req, res, next) => {
  try {
    const { status, supplierId, customerId, daysRemaining, search, page = 1, limit = 20 } = req.query;

    const filter = { beraterId: req.user._id };

    if (status) filter.status = status;
    if (supplierId) filter.supplierId = supplierId;
    if (customerId) filter.customerId = customerId;
    if (req.query.meterId) filter.meterId = req.query.meterId;

    // Filter für auslaufende Verträge
    if (daysRemaining) {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + parseInt(daysRemaining));

      filter.endDate = {
        $gte: today,
        $lte: futureDate
      };
      filter.status = 'active';
    }

    // Suchfunktion: suche in Vertragsnummer, Kundendaten, Zählernummer
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');

      // Suche zuerst passende Kunden und Zähler
      const Customer = require('../models/Customer');
      const Meter = require('../models/Meter');

      const [matchingCustomers, matchingMeters] = await Promise.all([
        Customer.find({
          beraterId: req.user._id,
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { customerNumber: searchRegex }
          ]
        }).select('_id'),
        Meter.find({
          beraterId: req.user._id,
          meterNumber: searchRegex
        }).select('_id')
      ]);

      const customerIds = matchingCustomers.map(c => c._id);
      const meterIds = matchingMeters.map(m => m._id);

      filter.$or = [
        { contractNumber: searchRegex },
        { supplierContractNumber: searchRegex }
      ];

      if (customerIds.length > 0) {
        filter.$or.push({ customerId: { $in: customerIds } });
      }
      if (meterIds.length > 0) {
        filter.$or.push({ meterId: { $in: meterIds } });
      }
    }

    const skip = (page - 1) * limit;
    const total = await Contract.countDocuments(filter);

    const contracts = await Contract.find(filter)
      .populate('customerId', 'firstName lastName customerNumber')
      .populate('meterId', 'meterNumber type')
      .populate('supplierId', 'name shortName')
      .sort({ createdAt: -1 }) // Neueste Verträge zuerst
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      data: contracts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contract
// @route   GET /api/contracts/:id
// @access  Private
exports.getContract = async (req, res, next) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    })
      .populate('customerId', 'firstName lastName customerNumber email phone')
      .populate('meterId', 'meterNumber type location')
      .populate('supplierId', 'name shortName contactEmail contactPhone');

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Vertrag nicht gefunden'
      });
    }

    res.status(200).json({
      success: true,
      data: contract
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create contract
// @route   POST /api/contracts
// @access  Private
exports.createContract = async (req, res, next) => {
  const mongoose = require('mongoose');
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const Contract = require('../models/Contract');
    const Meter = require('../models/Meter');
    const MeterHistory = require('../models/MeterHistory');

    const {
      customerId,
      meterId,
      startDate,
      durationMonths
    } = req.body;

    // 1️⃣ Enddatum berechnen
    let endDate = req.body.endDate;
    if (!endDate && startDate && durationMonths) {
      const start = new Date(startDate);
      endDate = new Date(start);
      endDate.setMonth(endDate.getMonth() + parseInt(durationMonths));
    }

    // 2️⃣ Zähler laden & Berater-Zugriff prüfen
    const meter = await Meter.findOne({
      _id: meterId,
      beraterId: req.user._id
    }).session(session);

    if (!meter) {
      throw new Error('Zähler nicht gefunden oder kein Zugriff');
    }

    // 3️⃣ Prüfen: Zähler bereits aktiv belegt?
    const activeContract = await Contract.findOne({
      meterId,
      beraterId: req.user._id,
      status: 'active'
    }).session(session);

    if (activeContract) {
      throw new Error('Zähler ist bereits in einem aktiven Vertrag');
    }

    // 4️⃣ Prüfen: Startdatum nicht vor Enddatum eines gekündigten/beendeten Vertrags
    const lastEndedContract = await Contract.findOne({
      meterId,
      beraterId: req.user._id,
      status: { $in: ['archived', 'ended'] },
      endDate: { $exists: true, $ne: null }
    })
      .sort({ endDate: -1 })
      .session(session);

    if (lastEndedContract && startDate) {
      const newStartDate = new Date(startDate);
      const lastEndDate = new Date(lastEndedContract.endDate);

      // Nur Datum vergleichen (ohne Uhrzeit)
      newStartDate.setHours(0, 0, 0, 0);
      lastEndDate.setHours(0, 0, 0, 0);

      if (newStartDate < lastEndDate) {
        const formattedEndDate = lastEndDate.toLocaleDateString('de-DE');
        throw new Error(`Startdatum darf nicht vor dem ${formattedEndDate} liegen (Enddatum des vorherigen Vertrags für diesen Zähler)`);
      }
    }

    // 5️⃣ Vertragsnummer erzeugen (TX-sicher)
    const contractNumber = await getNextContractNumber(req.user._id, session);

    // 6️⃣ Vertrag anlegen
    const [contract] = await Contract.create([{
      ...req.body,
      contractNumber,
      endDate,
      beraterId: req.user._id,
      auditLog: [{
        userId: req.user._id,
        action: 'created',
        timestamp: new Date()
      }]
    }], { session });

    // 7️⃣ Zähler belegen
    await Meter.updateOne(
      { _id: meterId },
      { currentCustomerId: customerId },
      { session }
    );

    // 8️⃣ MeterHistory anlegen
    await MeterHistory.create([{
      meterId,
      beraterId: req.user._id,
      customerId,
      contractId: contract._id,
      startDate: new Date(startDate),
      endDate: null
    }], { session });

    // 9️⃣ Commit
    await session.commitTransaction();
    session.endSession();

    // 🔟 Populierten Vertrag zurückgeben
    const populatedContract = await Contract.findById(contract._id)
      .populate('customerId', 'firstName lastName customerNumber')
      .populate('meterId', 'meterNumber type')
      .populate('supplierId', 'name shortName');

    res.status(201).json({
      success: true,
      data: populatedContract
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Update contract
// @route   PUT /api/contracts/:id
// @access  Private
exports.updateContract = async (req, res, next) => {
  const mongoose = require('mongoose');
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    }).session(session);

    if (!contract) {
      throw new Error('Vertrag nicht gefunden');
    }

    const changes = {};
    const allowedFields = [
      'durationMonths',
      'notes',
      'status',
      'endDate',
      'startDate',
      'supplierContractNumber'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== contract[field]) {
        changes[field] = { old: contract[field], new: req.body[field] };
        contract[field] = req.body[field];
      }
    });

    if (contract.status === 'active' && contract.endDate < new Date()) {
      throw new Error('Aktiver Vertrag kann kein Enddatum in der Vergangenheit haben');
    }

    contract.auditLog.push({
      userId: req.user._id,
      action: 'updated',
      changes,
      timestamp: new Date()
    });

    await contract.save({ session });

    // 🔁 Zähler & Historie konsistent halten
    await updateMeterStatusTx(contract, session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      data: contract
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Delete contract
// @route   DELETE /api/contracts/:id
// @access  Private
exports.deleteContract = async (req, res, next) => {
  const mongoose = require('mongoose');
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const Meter = require('../models/Meter');
    const MeterHistory = require('../models/MeterHistory');

    // 1️⃣ Vertrag laden (berater-gescoped, TX)
    const contract = await Contract.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    }).session(session);

    if (!contract) {
      throw new Error('Vertrag nicht gefunden');
    }

    // 2️⃣ Aktive Verträge dürfen nicht gelöscht werden
    if (contract.status === 'active') {
      throw new Error(
        'Aktive Verträge können nicht gelöscht werden. Bitte beenden Sie den Vertrag zuerst.'
      );
    }

    // 3️⃣ Zähler freigeben, wenn Vertrag noch keinen aktiven Betrieb hatte
    if (contract.status === 'draft') {
      await Meter.findOneAndUpdate(
        {
          _id: contract.meterId,
          beraterId: req.user._id
        },
        { currentCustomerId: null },
        { session }
      );

      // 4️⃣ Offene Meter-Historie schließen
      await MeterHistory.findOneAndUpdate(
        {
          contractId: contract._id,
          beraterId: req.user._id,
          endDate: null
        },
        { endDate: new Date() },
        { session }
      );
    }

    // 5️⃣ Erinnerungen löschen
    await Reminder.deleteMany(
      { contractId: contract._id },
      { session }
    );

    // 6️⃣ Attachments vom Dateisystem löschen (nicht TX-relevant)
    if (contract.attachments?.length) {
      const fs = require('fs');

      for (const attachment of contract.attachments) {
        if (fs.existsSync(attachment.path)) {
          fs.unlinkSync(attachment.path);
        }
      }
    }

    // 7️⃣ Vertrag löschen
    await contract.deleteOne({ session });

    // 8️⃣ Commit
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Vertrag erfolgreich gelöscht'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Saubere Fehlermeldung
    res.status(400).json({
      success: false,
      message: error.message || 'Fehler beim Löschen des Vertrags'
    });
  }
};


// @desc    Upload attachment to contract
// @route   POST /api/contracts/:id/attachments
// @access  Private
exports.uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Keine Datei hochgeladen'
      });
    }

    const contract = await Contract.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!contract) {
      // Datei löschen wenn Vertrag nicht gefunden
      const fs = require('fs');
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Vertrag nicht gefunden'
      });
    }

    // Attachment zum Contract hinzufügen
    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedAt: new Date(),
      uploadedBy: req.user._id
    };

    contract.attachments.push(attachment);
    await contract.save();

    res.status(200).json({
      success: true,
      message: 'Datei erfolgreich hochgeladen',
      data: attachment
    });
  } catch (error) {
    // Datei löschen bei Fehler
    if (req.file && req.file.path) {
      const fs = require('fs');
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    next(error);
  }
};

// @desc    Delete attachment from contract
// @route   DELETE /api/contracts/:id/attachments/:attachmentId
// @access  Private
exports.deleteAttachment = async (req, res, next) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Vertrag nicht gefunden'
      });
    }

    const attachment = contract.attachments.id(req.params.attachmentId);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Datei nicht gefunden'
      });
    }

    // Datei vom Dateisystem löschen
    const fs = require('fs');
    if (fs.existsSync(attachment.path)) {
      fs.unlinkSync(attachment.path);
    }

    // Attachment aus Array entfernen
    attachment.deleteOne();
    await contract.save();

    res.status(200).json({
      success: true,
      message: 'Datei erfolgreich gelöscht'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download attachment
// @route   GET /api/contracts/:id/attachments/:attachmentId
// @access  Private
exports.downloadAttachment = async (req, res, next) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      beraterId: req.user._id
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Vertrag nicht gefunden'
      });
    }

    const attachment = contract.attachments.id(req.params.attachmentId);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Datei nicht gefunden'
      });
    }

    const fs = require('fs');
    if (!fs.existsSync(attachment.path)) {
      return res.status(404).json({
        success: false,
        message: 'Datei existiert nicht mehr auf dem Server'
      });
    }

    // Datei zum Download senden
    res.download(attachment.path, attachment.originalName);
  } catch (error) {
    next(error);
  }
};

async function updateMeterStatusTx(contract, session) {
  const Meter = require('../models/Meter');
  const MeterHistory = require('../models/MeterHistory');

  const isFree = contract.status === 'ended' || contract.status === 'archived';

  await Meter.findOneAndUpdate(
    {
      _id: contract.meterId,
      beraterId: contract.beraterId
    },
    {
      currentCustomerId: isFree ? null : contract.customerId
    },
    { session }
  );

  if (isFree) {
    await MeterHistory.findOneAndUpdate(
      {
        contractId: contract._id,
        beraterId: contract.beraterId,
        endDate: null
      },
      {
        endDate: contract.endDate || new Date()
      },
      { session }
    );
  }
}

// @desc    Get minimum start date for a new contract with a meter
// @route   GET /api/contracts/meter/:meterId/min-start-date
// @access  Private
exports.getMinStartDateForMeter = async (req, res, next) => {
  try {
    const { meterId } = req.params;

    // Letzten beendeten/gekündigten Vertrag für diesen Zähler finden
    const lastEndedContract = await Contract.findOne({
      meterId,
      beraterId: req.user._id,
      status: { $in: ['archived', 'ended'] },
      endDate: { $exists: true, $ne: null }
    }).sort({ endDate: -1 });

    let minStartDate = null;

    if (lastEndedContract && lastEndedContract.endDate) {
      minStartDate = new Date(lastEndedContract.endDate).toISOString().split('T')[0];
    }

    res.status(200).json({
      success: true,
      minStartDate
    });
  } catch (error) {
    next(error);
  }
};
