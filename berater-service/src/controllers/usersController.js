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
