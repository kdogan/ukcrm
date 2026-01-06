const express = require('express');
const router = express.Router();
const EducationMaterial = require('../models/EducationMaterial');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// GET /api/education - Alle Materialien für den aktuellen User
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    let materials;

    if (user.isMasterBerater) {
      // Master Berater sieht alle seine erstellten Materialien
      materials = await EducationMaterial.find({
        createdBy: userId,
        isActive: true
      })
        .select('-pdfData') // PDF-Daten nicht laden (zu groß)
        .populate('createdBy', 'firstName lastName email')
        .populate('sharedWith', 'firstName lastName email')
        .sort({ order: 1, createdAt: -1 });
    } else {
      // Slave-Berater sehen NUR Materialien ihres Master Beraters
      if (!user.masterBerater) {
        // Kein Master zugewiesen = keine Materialien
        materials = [];
      } else {
        // Nur Materialien vom eigenen Master Berater
        materials = await EducationMaterial.find({
          createdBy: user.masterBerater,
          isActive: true
        })
          .select('-pdfData') // PDF-Daten nicht laden (zu groß)
          .populate('createdBy', 'firstName lastName email')
          .sort({ order: 1, createdAt: -1 });
      }
    }

    res.json({
      success: true,
      data: materials
    });
  } catch (error) {
    console.error('Fehler beim Laden der Education-Materialien:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Materialien',
      error: error.message
    });
  }
});

// GET /api/education/stats - Statistiken für Master Berater
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user.isMasterBerater) {
      return res.status(403).json({
        success: false,
        message: 'Nur Master Berater haben Zugriff auf Statistiken'
      });
    }

    const totalMaterials = await EducationMaterial.countDocuments({
      createdBy: userId,
      isActive: true
    });

    const materialsByType = await EducationMaterial.aggregate([
      { $match: { createdBy: userId, isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const totalViews = await EducationMaterial.aggregate([
      { $match: { createdBy: userId, isActive: true } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    const sharedBeraterCount = await EducationMaterial.aggregate([
      { $match: { createdBy: userId, isActive: true } },
      { $unwind: '$sharedWith' },
      { $group: { _id: '$sharedWith' } },
      { $count: 'count' }
    ]);

    res.json({
      success: true,
      data: {
        totalMaterials,
        materialsByType,
        totalViews: totalViews.length > 0 ? totalViews[0].totalViews : 0,
        sharedBeraterCount: sharedBeraterCount.length > 0 ? sharedBeraterCount[0].count : 0
      }
    });
  } catch (error) {
    console.error('Fehler beim Laden der Statistiken:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Statistiken',
      error: error.message
    });
  }
});

// GET /api/education/berater/list - Liste der Slave-Berater für Sharing
// WICHTIG: Diese Route MUSS vor /:id stehen, sonst matched /:id auch /berater/list
router.get('/berater/list', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.isMasterBerater) {
      return res.status(403).json({
        success: false,
        message: 'Nur Master Berater können Berater-Listen abrufen'
      });
    }

    // Nur Berater, die DIESEN Master zugewiesen haben
    const berater = await User.find({
      role: 'berater',
      isActive: true,
      isBlocked: false,
      masterBerater: req.user._id  // Nur eigene Slave-Berater
    })
      .select('firstName lastName email isMasterBerater')
      .sort({ lastName: 1, firstName: 1 });

    res.json({
      success: true,
      data: berater
    });
  } catch (error) {
    console.error('Fehler beim Laden der Berater-Liste:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Berater-Liste',
      error: error.message
    });
  }
});

// GET /api/education/pdf/:id - PDF-Datei abrufen
router.get('/pdf/:id', authenticate, async (req, res) => {
  try {
    const material = await EducationMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material nicht gefunden'
      });
    }

    if (material.type !== 'pdf' || !material.pdfData) {
      return res.status(404).json({
        success: false,
        message: 'Keine PDF-Datei vorhanden'
      });
    }

    // Zugriffsprüfung
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    const isCreator = material.createdBy.toString() === userId;

    // Slave-Berater haben nur Zugriff auf Materialien ihres Masters
    const isSlaveBeraterWithAccess = user.masterBerater &&
                                      material.createdBy.toString() === user.masterBerater.toString();

    if (!isCreator && !isSlaveBeraterWithAccess) {
      return res.status(403).json({
        success: false,
        message: 'Kein Zugriff auf dieses PDF'
      });
    }

    // View registrieren
    if (!isCreator) {
      await material.registerView(userId);
    }

    // Dateinamen für Header sicher kodieren (RFC 5987)
    const filename = material.pdfName || 'document.pdf';
    const encodedFilename = encodeURIComponent(filename).replace(/['()]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());

    res.set({
      'Content-Type': material.pdfMimeType || 'application/pdf',
      'Content-Disposition': `inline; filename="document.pdf"; filename*=UTF-8''${encodedFilename}`,
      'Content-Length': material.pdfData.length
    });

    res.send(material.pdfData);
  } catch (error) {
    console.error('Fehler beim Abrufen des PDFs:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen des PDFs',
      error: error.message
    });
  }
});

// GET /api/education/:id - Einzelnes Material abrufen
router.get('/:id', authenticate, async (req, res) => {
  try {
    const material = await EducationMaterial.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('sharedWith', 'firstName lastName email');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material nicht gefunden'
      });
    }

    // Zugriffsprüfung
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    const isCreator = material.createdBy._id.toString() === userId;

    // Slave-Berater haben nur Zugriff auf Materialien ihres Masters
    const isSlaveBeraterWithAccess = user.masterBerater &&
                                      material.createdBy._id.toString() === user.masterBerater.toString();

    if (!isCreator && !isSlaveBeraterWithAccess) {
      return res.status(403).json({
        success: false,
        message: 'Kein Zugriff auf dieses Material'
      });
    }

    // View registrieren
    if (!isCreator) {
      await material.registerView(userId);
    }

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Fehler beim Laden des Materials:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden des Materials',
      error: error.message
    });
  }
});

// POST /api/education/:id/view - View registrieren
router.post('/:id/view', authenticate, async (req, res) => {
  try {
    const material = await EducationMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material nicht gefunden'
      });
    }

    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    const isCreator = material.createdBy.toString() === userId;

    // Slave-Berater haben nur Zugriff auf Materialien ihres Masters
    const isSlaveBeraterWithAccess = user.masterBerater &&
                                      material.createdBy.toString() === user.masterBerater.toString();

    if (!isCreator && !isSlaveBeraterWithAccess) {
      return res.status(403).json({
        success: false,
        message: 'Kein Zugriff auf dieses Material'
      });
    }

    // View nur registrieren wenn NICHT der Ersteller
    if (!isCreator) {
      await material.registerView(userId);
    }

    res.json({
      success: true,
      message: 'View registriert',
      data: { views: material.views }
    });
  } catch (error) {
    console.error('Fehler beim Registrieren des Views:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Registrieren des Views',
      error: error.message
    });
  }
});

// POST /api/education - Neues Material erstellen (nur Master Berater)
router.post('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.isMasterBerater) {
      return res.status(403).json({
        success: false,
        message: 'Nur Master Berater können Materialien erstellen'
      });
    }

    const materialData = { ...req.body, createdBy: req.user._id };

    // PDF Base64 verarbeiten
    if (req.body.type === 'pdf' && req.body.pdfBase64) {
      const base64Data = req.body.pdfBase64;
      const matches = base64Data.match(/^data:(.+);base64,(.+)$/);

      if (!matches) {
        return res.status(400).json({
          success: false,
          message: 'Ungültiges PDF-Format'
        });
      }

      const buffer = Buffer.from(matches[2], 'base64');

      // 12MB Limit prüfen
      if (buffer.length > 12 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'PDF darf maximal 12 MB groß sein'
        });
      }

      materialData.pdfData = buffer;
      materialData.pdfMimeType = matches[1];
      materialData.pdfName = req.body.pdfName || 'document.pdf';

      // Base64 nicht in DB speichern
      delete materialData.pdfBase64;
    }

    const material = new EducationMaterial(materialData);
    await material.save();

    // PDF-Daten nicht in Response senden (zu groß)
    const responseData = material.toObject();
    delete responseData.pdfData;

    await material.populate('createdBy', 'firstName lastName email');
    await material.populate('sharedWith', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Material erfolgreich erstellt',
      data: responseData
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Materials:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Erstellen des Materials',
      error: error.message
    });
  }
});

// PUT /api/education/:id - Material aktualisieren (nur Creator)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const material = await EducationMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material nicht gefunden'
      });
    }

    // Nur Creator kann Material aktualisieren
    if (material.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung zum Bearbeiten'
      });
    }

    // PDF Base64 verarbeiten falls vorhanden
    if (req.body.type === 'pdf' && req.body.pdfBase64) {
      const base64Data = req.body.pdfBase64;
      const matches = base64Data.match(/^data:(.+);base64,(.+)$/);

      if (!matches) {
        return res.status(400).json({
          success: false,
          message: 'Ungültiges PDF-Format'
        });
      }

      const buffer = Buffer.from(matches[2], 'base64');

      // 12MB Limit prüfen
      if (buffer.length > 12 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'PDF darf maximal 12 MB groß sein'
        });
      }

      material.pdfData = buffer;
      material.pdfMimeType = matches[1];
      material.pdfName = req.body.pdfName || material.pdfName || 'document.pdf';
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'createdBy' && key !== 'pdfBase64' && key !== 'pdfData') {
        material[key] = req.body[key];
      }
    });

    await material.save();

    // PDF-Daten nicht in Response senden (zu groß)
    const responseData = material.toObject();
    delete responseData.pdfData;

    await material.populate('createdBy', 'firstName lastName email');
    await material.populate('sharedWith', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Material erfolgreich aktualisiert',
      data: responseData
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Materials:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Aktualisieren des Materials',
      error: error.message
    });
  }
});

// DELETE /api/education/:id - Material löschen (soft delete)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const material = await EducationMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material nicht gefunden'
      });
    }

    // Nur Creator kann Material löschen
    if (material.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung zum Löschen'
      });
    }

    material.isActive = false;
    await material.save();

    res.json({
      success: true,
      message: 'Material erfolgreich gelöscht'
    });
  } catch (error) {
    console.error('Fehler beim Löschen des Materials:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Löschen des Materials',
      error: error.message
    });
  }
});

module.exports = router;
