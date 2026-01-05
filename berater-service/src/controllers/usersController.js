const User = require('../models/User');
const crypto = require('crypto');

/**
 * 📥 Lade User für Chat-Start
 * Admin: alle Berater
 * Berater: nur Systemadmin
 */
exports.loadUsers = async (req, res) => {
  try {
    const currentUser = req.user; // vom Auth Middleware gesetzt

    let users;

    if (currentUser.role === 'superadmin' || currentUser.role === 'admin') {
      // Admin: alle Berater
      users = await User.find({ role: 'berater', isActive: true })
        .select('_id firstName lastName email address'); // nur relevante Felder
    } else {
      // Berater: nur Systemadmin
      users = await User.find({ role: { $in: ['superadmin', 'admin'] }, isActive: true })
        .select('_id firstName lastName email address');
    }

    // Optional: Name zusammenfassen
    const formattedUsers = users.map(u => ({
      _id: u._id,
      name: `${u.firstName} ${u.lastName}`,
      address: u.address || ''
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error('Fehler beim Laden der User:', err);
    res.status(500).json({ error: 'Fehler beim Laden der User' });
  }
};

/**
 * 🎓 Update Master Berater
 * Berater kann seinen Master Berater per E-Mail setzen/ändern
 */
exports.updateMasterBerater = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { masterBeraterEmail } = req.body;

    // Aktuellen User laden
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    // Nur Berater können Master Berater setzen
    if (currentUser.role !== 'berater') {
      return res.status(403).json({
        success: false,
        message: 'Nur Berater können einen Master Berater zuweisen'
      });
    }

    // Wenn E-Mail leer ist, Master Berater entfernen
    if (!masterBeraterEmail || masterBeraterEmail.trim() === '') {
      currentUser.masterBerater = null;
      await currentUser.save();

      return res.json({
        success: true,
        message: 'Master Berater erfolgreich entfernt',
        data: {
          masterBerater: null
        }
      });
    }

    // Master Berater per E-Mail suchen
    const masterBerater = await User.findOne({
      email: masterBeraterEmail.toLowerCase().trim(),
      role: 'berater',
      isMasterBerater: true,
      isActive: true
    });

    if (!masterBerater) {
      return res.status(404).json({
        success: false,
        message: 'Kein aktiver Master Berater mit dieser E-Mail-Adresse gefunden'
      });
    }

    // Prüfen, ob User sich selbst als Master zuweisen möchte
    if (masterBerater._id.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Sie können sich nicht selbst als Master Berater zuweisen'
      });
    }

    // Master Berater zuweisen
    currentUser.masterBerater = masterBerater._id;
    await currentUser.save();

    res.json({
      success: true,
      message: 'Master Berater erfolgreich zugewiesen',
      data: {
        masterBerater: {
          _id: masterBerater._id,
          firstName: masterBerater.firstName,
          lastName: masterBerater.lastName,
          email: masterBerater.email
        }
      }
    });
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Master Beraters:', err);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Aktualisieren des Master Beraters',
      error: err.message
    });
  }
};

/**
 * 🔑 Token generieren/neu generieren für Master Berater
 * Nur Master Berater können einen Share-Token erstellen
 */
exports.generateShareToken = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    if (!currentUser.isMasterBerater) {
      return res.status(403).json({
        success: false,
        message: 'Nur Master Berater können einen Share-Token generieren'
      });
    }

    // Neuen 8-stelligen Token generieren (Großbuchstaben + Zahlen)
    const token = crypto.randomBytes(4).toString('hex').toUpperCase();

    currentUser.shareToken = token;
    await currentUser.save();

    res.json({
      success: true,
      message: 'Share-Token erfolgreich generiert',
      data: {
        shareToken: token
      }
    });
  } catch (err) {
    console.error('Fehler beim Generieren des Share-Tokens:', err);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Generieren des Share-Tokens',
      error: err.message
    });
  }
};

/**
 * 🔗 Master Berater per Token verbinden
 * Berater gibt Token ein und wird dem Master Berater zugewiesen
 */
exports.connectByToken = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { token } = req.body;

    if (!token || token.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Token ist erforderlich'
      });
    }

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    if (currentUser.isMasterBerater) {
      return res.status(403).json({
        success: false,
        message: 'Master Berater können sich nicht mit anderen Master Beratern verbinden'
      });
    }

    // Master Berater per Token suchen
    const masterBerater = await User.findOne({
      shareToken: token.toUpperCase().trim(),
      isMasterBerater: true,
      isActive: true
    });

    if (!masterBerater) {
      return res.status(404).json({
        success: false,
        message: 'Kein Master Berater mit diesem Token gefunden'
      });
    }

    // Master Berater zuweisen
    currentUser.masterBerater = masterBerater._id;
    await currentUser.save();

    res.json({
      success: true,
      message: 'Erfolgreich mit Master Berater verbunden',
      data: {
        masterBerater: {
          _id: masterBerater._id,
          firstName: masterBerater.firstName,
          lastName: masterBerater.lastName
        }
      }
    });
  } catch (err) {
    console.error('Fehler beim Verbinden mit Master Berater:', err);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Verbinden mit Master Berater',
      error: err.message
    });
  }
};

/**
 * 🔓 Verbindung zum Master Berater trennen
 */
exports.disconnectMasterBerater = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    if (!currentUser.masterBerater) {
      return res.status(400).json({
        success: false,
        message: 'Sie sind mit keinem Master Berater verbunden'
      });
    }

    currentUser.masterBerater = null;
    await currentUser.save();

    res.json({
      success: true,
      message: 'Verbindung zum Master Berater erfolgreich getrennt'
    });
  } catch (err) {
    console.error('Fehler beim Trennen der Verbindung:', err);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Trennen der Verbindung',
      error: err.message
    });
  }
};

/**
 * 📋 Aktuellen Share-Token und Master Berater Status abrufen
 */
exports.getShareStatus = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId).populate('masterBerater', 'firstName lastName');

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    res.json({
      success: true,
      data: {
        isMasterBerater: currentUser.isMasterBerater,
        shareToken: currentUser.isMasterBerater ? currentUser.shareToken : null,
        masterBerater: currentUser.masterBerater ? {
          _id: currentUser.masterBerater._id,
          firstName: currentUser.masterBerater.firstName,
          lastName: currentUser.masterBerater.lastName
        } : null
      }
    });
  } catch (err) {
    console.error('Fehler beim Abrufen des Share-Status:', err);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen des Share-Status',
      error: err.message
    });
  }
};

/**
 * 🌐 Benutzersprache abrufen
 */
exports.getLanguage = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId).select('language');

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    res.json({
      success: true,
      data: {
        language: currentUser.language || 'de'
      }
    });
  } catch (err) {
    console.error('Fehler beim Abrufen der Sprache:', err);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Sprache',
      error: err.message
    });
  }
};

/**
 * 🌐 Benutzersprache aktualisieren
 */
exports.updateLanguage = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { language } = req.body;

    // Validierung
    if (!language || !['de', 'tr'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Ungültige Sprache. Erlaubt sind: de, tr'
      });
    }

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    currentUser.language = language;
    await currentUser.save();

    res.json({
      success: true,
      message: 'Sprache erfolgreich aktualisiert',
      data: {
        language: currentUser.language
      }
    });
  } catch (err) {
    console.error('Fehler beim Aktualisieren der Sprache:', err);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Aktualisieren der Sprache',
      error: err.message
    });
  }
};
