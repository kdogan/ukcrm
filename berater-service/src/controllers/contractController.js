const Contract = require('../models/Contract');
const Reminder = require('../models/Reminder');
const getNextContractNumber = require('../utils/getNextContractNumber');

// @desc    Get all contracts
// @route   GET /api/contracts
// @access  Private
exports.getContracts = async (req, res, next) => {
  try {
    const { status, supplierId, daysRemaining, page = 1, limit = 20 } = req.query;

    const filter = { beraterId: req.user._id };

    if (status) filter.status = status;
    if (supplierId) filter.supplierId = supplierId;

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
  try {
    // Enddatum berechnen
    let endDate = req.body.endDate;
    if (!endDate && req.body.startDate && req.body.durationMonths) {
      const startDate = new Date(req.body.startDate);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(req.body.durationMonths));
    }

    // ✅ Vertragsnummer automatisch erzeugen
    const contractNumber = await getNextContractNumber();

    const contractData = {
      ...req.body,
      contractNumber,          // 🔥 HIER
      endDate,
      beraterId: req.user._id,
      auditLog: [{
        userId: req.user._id,
        action: 'created',
        timestamp: new Date()
      }]
    };

    const contract = await Contract.create(contractData);

    // Zähler belegen
    const Meter = require('../models/Meter');
    const MeterHistory = require('../models/MeterHistory');

    await Meter.findByIdAndUpdate(req.body.meterId, {
      currentCustomerId: req.body.customerId
    });

    await MeterHistory.create({
      meterId: req.body.meterId,
      beraterId: req.user._id,
      customerId: req.body.customerId,
      contractId: contract._id,
      startDate: new Date(req.body.startDate),
      endDate: null
    });

    await createReminders(contract);

    const populatedContract = await Contract.findById(contract._id)
      .populate('customerId', 'firstName lastName customerNumber')
      .populate('meterId', 'meterNumber type')
      .populate('supplierId', 'name shortName');

    res.status(201).json({
      success: true,
      data: populatedContract
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contract
// @route   PUT /api/contracts/:id
// @access  Private
exports.updateContract = async (req, res, next) => {
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

    // Audit Log
    const changes = {};
    const allowedFields = ['durationMonths', 'notes', 'status', 'endDate', 'supplierContractNumber'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== contract[field]) {
        changes[field] = { old: contract[field], new: req.body[field] };
        contract[field] = req.body[field];
      }
    });

    contract.auditLog.push({
      userId: req.user._id,
      action: 'updated',
      changes,
      timestamp: new Date()
    });

    await contract.save();
    await updateMeterStatus(contract);

    // Erinnerungen aktualisieren wenn Laufzeit geändert
    if (changes.durationMonths) {
      await Reminder.deleteMany({ contractId: contract._id });
      await createReminders(contract);
    }

    res.status(200).json({
      success: true,
      data: contract
    });
  } catch (error) {
    next(error);
  }
};

async function updateMeterStatus(contract) {
  const Meter = require('../models/Meter');
  const MeterHistory = require('../models/MeterHistory');

  // Wenn Vertrag beendet oder archiviert wird, Zähler freigeben
  const isFree = contract.status === 'ended' || contract.status === 'archived';

  await Meter.findByIdAndUpdate(contract.meterId, {
    currentCustomerId: isFree ? null : contract.customerId
  });

  // Schließe offene Historie für diesen Vertrag wenn beendet/archiviert
  if (isFree) {
    await MeterHistory.findOneAndUpdate(
      {
        contractId: contract._id,
        endDate: null
      },
      {
        endDate: contract.endDate || new Date()
      }
    );
  }
}

// @desc    Update contract status
// @route   PATCH /api/contracts/:id/status
// @access  Private
exports.updateContractStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'ended', 'archived', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Ungültiger Status'
      });
    }

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

    const oldStatus = contract.status;
    contract.status = status;
    contract.auditLog.push({
      userId: req.user._id,
      action: 'status_changed',
      changes: { status: { old: oldStatus, new: status } },
      timestamp: new Date()
    });

    await contract.save();
    await updateMeterStatus(contract);

    res.status(200).json({
      success: true,
      data: contract
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contract
// @route   DELETE /api/contracts/:id
// @access  Private
exports.deleteContract = async (req, res, next) => {
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

    // Prüfe ob Vertrag aktiv ist (aktiv oder in Belieferung)
    if (contract.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Aktive Verträge können nicht gelöscht werden. Bitte beenden Sie den Vertrag zuerst.'
      });
    }

    // Zähler freigeben wenn Vertrag draft war
    if (contract.status === 'draft') {
      const Meter = require('../models/Meter');
      const MeterHistory = require('../models/MeterHistory');

      await Meter.findByIdAndUpdate(contract.meterId, {
        currentCustomerId: null
      });

      // Schließe offene Historie für diesen Vertrag
      await MeterHistory.findOneAndUpdate(
        {
          contractId: contract._id,
          endDate: null
        },
        {
          endDate: new Date()
        }
      );
    }

    // Lösche alle Erinnerungen für diesen Vertrag
    await Reminder.deleteMany({ contractId: contract._id });

    // Lösche alle Attachments
    if (contract.attachments && contract.attachments.length > 0) {
      const fs = require('fs');
      contract.attachments.forEach(attachment => {
        if (fs.existsSync(attachment.path)) {
          fs.unlinkSync(attachment.path);
        }
      });
    }

    // Vertrag löschen
    await contract.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vertrag erfolgreich gelöscht'
    });
  } catch (error) {
    next(error);
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
