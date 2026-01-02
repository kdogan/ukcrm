const User = require('../models/User');

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
