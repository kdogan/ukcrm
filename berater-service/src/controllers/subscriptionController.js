const User = require('../models/User');

/**
 * Gibt die Subscription-Informationen des aktuellen Benutzers zurück
 */
exports.getMySubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('package subscription packageLimits');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    // Berechne Tage bis zum Ablauf
    let daysUntilExpiration = null;
    let isExpiringSoon = false;
    let expirationWarningLevel = null; // 'danger', 'warning', 'info'

    if (user.subscription && user.subscription.endDate && user.package !== 'free') {
      const now = new Date();
      const endDate = new Date(user.subscription.endDate);
      const timeDiff = endDate.getTime() - now.getTime();
      daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Bestimme Warnstufe
      if (daysUntilExpiration <= 0) {
        expirationWarningLevel = 'expired';
        isExpiringSoon = true;
      } else if (daysUntilExpiration <= 7) {
        expirationWarningLevel = 'danger';
        isExpiringSoon = true;
      } else if (daysUntilExpiration <= 14) {
        expirationWarningLevel = 'warning';
        isExpiringSoon = true;
      } else if (daysUntilExpiration <= 30) {
        expirationWarningLevel = 'info';
        isExpiringSoon = true;
      }
    }

    res.json({
      success: true,
      data: {
        package: user.package,
        subscription: user.subscription,
        packageLimits: user.packageLimits,
        daysUntilExpiration,
        isExpiringSoon,
        expirationWarningLevel
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Subscription-Informationen'
    });
  }
};

/**
 * Gibt alle Benutzer mit ablaufenden Paketen zurück (nur für Superadmin)
 */
exports.getExpiringSubscriptions = async (req, res) => {
  try {
    // Nur Superadmin darf diese Informationen sehen
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung'
      });
    }

    const { daysThreshold = 30 } = req.query;
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + parseInt(daysThreshold));

    // Finde alle Benutzer mit ablaufenden Paketen (außer free)
    const expiringUsers = await User.find({
      package: { $ne: 'free' },
      'subscription.endDate': {
        $exists: true,
        $lte: thresholdDate,
        $gte: now
      },
      isActive: true
    })
    .select('email firstName lastName package subscription packageLimits lastLogin')
    .sort({ 'subscription.endDate': 1 });

    // Berechne Tage bis zum Ablauf für jeden Benutzer
    const usersWithDays = expiringUsers.map(user => {
      const timeDiff = new Date(user.subscription.endDate).getTime() - now.getTime();
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));

      let warningLevel = 'info';
      if (daysUntilExpiration <= 0) {
        warningLevel = 'expired';
      } else if (daysUntilExpiration <= 7) {
        warningLevel = 'danger';
      } else if (daysUntilExpiration <= 14) {
        warningLevel = 'warning';
      }

      return {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        package: user.package,
        subscription: user.subscription,
        daysUntilExpiration,
        warningLevel,
        lastLogin: user.lastLogin
      };
    });

    // Finde auch bereits abgelaufene Pakete
    const expiredUsers = await User.find({
      package: { $ne: 'free' },
      'subscription.endDate': {
        $exists: true,
        $lt: now
      },
      isActive: true
    })
    .select('email firstName lastName package subscription packageLimits lastLogin')
    .sort({ 'subscription.endDate': -1 })
    .limit(50); // Maximal 50 abgelaufene anzeigen

    const expiredUsersWithInfo = expiredUsers.map(user => {
      const timeDiff = now.getTime() - new Date(user.subscription.endDate).getTime();
      const daysExpired = Math.ceil(timeDiff / (1000 * 3600 * 24));

      return {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        package: user.package,
        subscription: user.subscription,
        daysExpired,
        warningLevel: 'expired',
        lastLogin: user.lastLogin
      };
    });

    res.json({
      success: true,
      data: {
        expiring: usersWithDays,
        expired: expiredUsersWithInfo,
        summary: {
          totalExpiring: usersWithDays.length,
          totalExpired: expiredUsersWithInfo.length,
          dangerZone: usersWithDays.filter(u => u.warningLevel === 'danger').length,
          warningZone: usersWithDays.filter(u => u.warningLevel === 'warning').length
        }
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen ablaufender Subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der ablaufenden Subscriptions'
    });
  }
};

/**
 * Automatisch abgelaufene Pakete auf "free" zurücksetzen
 * Diese Funktion sollte täglich als Cron-Job ausgeführt werden
 */
exports.downgradeExpiredSubscriptions = async (req, res) => {
  try {
    // Nur Superadmin darf diese Aktion ausführen
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung'
      });
    }

    const now = new Date();

    // Finde alle Benutzer mit abgelaufenen Paketen
    const expiredUsers = await User.find({
      package: { $ne: 'free' },
      'subscription.endDate': {
        $exists: true,
        $lt: now
      },
      'subscription.status': 'active'
    });

    const downgradedUsers = [];

    for (const user of expiredUsers) {
      // Downgrade auf free Paket
      user.package = 'free';
      user.subscription.status = 'expired';
      user.packageLimits = {
        maxCustomers: 10,
        maxContracts: 20,
        maxMeters: 10
      };

      await user.save();

      downgradedUsers.push({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        previousPackage: user.package,
        expiredDate: user.subscription.endDate
      });
    }

    res.json({
      success: true,
      message: `${downgradedUsers.length} Benutzer wurden auf das kostenlose Paket herabgestuft`,
      data: downgradedUsers
    });
  } catch (error) {
    console.error('Fehler beim Downgrade abgelaufener Subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Downgrade der Subscriptions'
    });
  }
};
