const Contract = require('../models/Contract');
const Reminder = require('../models/Reminder');
const Todo = require('../models/Todo');
const getNextContractNumber = require('../utils/getNextContractNumber');

// @desc    Get all contracts
// @route   GET /api/contracts
// @access  Private
exports.getContracts = async (req, res, next) => {
  try {
    const { status, supplierId, customerId, daysRemaining, page = 1, limit = 20 } = req.query;

    const filter = { beraterId: req.user._id };

    if (status) filter.status = status;
    if (supplierId) filter.supplierId = supplierId;
    if (customerId) filter.customerId = customerId;

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

    const skip = (page - 1) * limit;
    const total = await Contract.countDocuments(filter);

    const contracts = await Contract.find(filter)
      .populate('customerId', 'firstName lastName customerNumber')
      .populate('meterId', 'meterNumber type')
      .populate('supplierId', 'name shortName')
      .sort({ endDate: 1 })
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

    // 4️⃣ Vertragsnummer erzeugen (TX-sicher)
    const contractNumber = await getNextContractNumber(req.user._id, session);

    // 5️⃣ Vertrag anlegen
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

    // 6️⃣ Zähler belegen
    await Meter.updateOne(
      { _id: meterId },
      { currentCustomerId: customerId },
      { session }
    );

    // 7️⃣ MeterHistory anlegen
    await MeterHistory.create([{
      meterId,
      beraterId: req.user._id,
      customerId,
      contractId: contract._id,
      startDate: new Date(startDate),
      endDate: null
    }], { session });

    // 8️⃣ Commit
    await session.commitTransaction();
    session.endSession();

    // 9️⃣ Reminders außerhalb der TX
    await createReminders(contract);

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

// Hilfsfunktion: Erinnerungen erstellen
async function createReminders(contract) {
  // Prüfe zuerst ob bereits ein TODO für diesen Vertrag existiert
  const existingTodo = await Todo.findOne({
    beraterId: contract.beraterId,
    relatedContractId: contract._id,
    autoGenerationType: 'contract_expiring',
    status: { $ne: 'completed' }
  });

  // Wenn bereits ein TODO existiert, keine Reminders erstellen
  if (existingTodo) {
    console.log(`Skipping reminder creation - TODO already exists for contract ${contract._id}`);
    return;
  }

  const reminders = [
    { type: '90days', days: 90 },
    { type: '60days', days: 60 },
    { type: '30days', days: 30 }
  ];

  for (const reminder of reminders) {
    const dueDate = new Date(contract.endDate);
    dueDate.setDate(dueDate.getDate() - reminder.days);

    // Nur erstellen wenn in der Zukunft
    if (dueDate > new Date()) {
      try {
        await Reminder.create({
          beraterId: contract.beraterId,
          contractId: contract._id,
          reminderType: reminder.type,
          dueDate,
          status: 'open'
        });
      } catch (error) {
        // Ignoriere Duplikat-Fehler
        if (error.code !== 11000) {
          console.error('Error creating reminder:', error);
        }
      }
    }
  }
}

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
