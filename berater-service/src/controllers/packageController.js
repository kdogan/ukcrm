const Package = require('../models/Package');
const User = require('../models/User');
const Contract = require('../models/Contract');
const { sendPackagePurchaseConfirmation } = require('../services/emailService');

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const packages = await Package.find(filter).sort({ order: 1 });

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Pakete',
      error: error.message
    });
  }
};

// Get single package
exports.getPackage = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);

    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Paket nicht gefunden'
      });
    }

    res.json({
      success: true,
      data: package
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden des Pakets',
      error: error.message
    });
  }
};

// Create package (Superadmin only)
exports.createPackage = async (req, res) => {
  try {
    // Sicherstellen, dass numerische Felder korrekt gespeichert werden
    const packageData = { ...req.body };
    if (packageData.monthlyPrice !== undefined) {
      packageData.monthlyPrice = parseFloat(packageData.monthlyPrice) || 0;
    }
    if (packageData.maxContracts !== undefined) {
      packageData.maxContracts = parseInt(packageData.maxContracts) || 0;
    }
    if (packageData.maxCustomers !== undefined) {
      packageData.maxCustomers = parseInt(packageData.maxCustomers) || 0;
    }
    if (packageData.maxMeters !== undefined) {
      packageData.maxMeters = parseInt(packageData.maxMeters) || 0;
    }
    if (packageData.order !== undefined) {
      packageData.order = parseInt(packageData.order) || 0;
    }

    const package = await Package.create(packageData);

    res.status(201).json({
      success: true,
      data: package,
      message: 'Paket erfolgreich erstellt'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ein Paket mit diesem Namen existiert bereits'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Fehler beim Erstellen des Pakets',
      error: error.message
    });
  }
};

// Update package (Superadmin only)
exports.updatePackage = async (req, res) => {
  try {
    // Sicherstellen, dass monthlyPrice als Number gespeichert wird
    const updateData = { ...req.body };
    if (updateData.monthlyPrice !== undefined) {
      updateData.monthlyPrice = parseFloat(updateData.monthlyPrice) || 0;
    }
    if (updateData.maxContracts !== undefined) {
      updateData.maxContracts = parseInt(updateData.maxContracts) || 0;
    }
    if (updateData.maxCustomers !== undefined) {
      updateData.maxCustomers = parseInt(updateData.maxCustomers) || 0;
    }
    if (updateData.maxMeters !== undefined) {
      updateData.maxMeters = parseInt(updateData.maxMeters) || 0;
    }
    if (updateData.order !== undefined) {
      updateData.order = parseInt(updateData.order) || 0;
    }

    const package = await Package.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Paket nicht gefunden'
      });
    }

    res.json({
      success: true,
      data: package,
      message: 'Paket erfolgreich aktualisiert'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Aktualisieren des Pakets',
      error: error.message
    });
  }
};

// Delete package (Superadmin only)
exports.deletePackage = async (req, res) => {
  try {
    // Hole das Paket zuerst
    const packageToDelete = await Package.findById(req.params.id);

    if (!packageToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Paket nicht gefunden'
      });
    }

    // Check if any users are using this package
    const usersWithPackage = await User.countDocuments({
      package: packageToDelete.name
    });

    if (usersWithPackage > 0) {
      return res.status(400).json({
        success: false,
        message: `Dieses Paket wird von ${usersWithPackage} Benutzer(n) verwendet und kann nicht gelöscht werden`
      });
    }

    await Package.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Paket erfolgreich gelöscht'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Löschen des Pakets',
      error: error.message
    });
  }
};

// Check user's package limits
exports.checkUserLimits = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user with package details
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    // Get package details
    const userPackage = await Package.findOne({ name: user.package });

    if (!userPackage) {
      return res.status(404).json({
        success: false,
        message: 'Paket nicht gefunden'
      });
    }

    // Count current usage
    const contractCount = await Contract.countDocuments({ beraterId: userId });
    // For now, we'll use simple counts. In the future, you could add Customer and Meter counts
    const customerCount = 0; // await Customer.countDocuments({ beraterId: userId });
    const meterCount = 0; // await Meter.countDocuments({ beraterId: userId });

    const data = {
      package: userPackage,
      usage: {
        contracts: contractCount,
        customers: customerCount,
        meters: meterCount
      },
      limits: {
        maxContracts: userPackage.maxContracts,
        maxCustomers: userPackage.maxCustomers,
        maxMeters: userPackage.maxMeters,
        contractsRemaining: userPackage.maxContracts === -1 ? -1 : Math.max(0, userPackage.maxContracts - contractCount),
        customersRemaining: userPackage.maxCustomers === -1 ? -1 : Math.max(0, userPackage.maxCustomers - customerCount),
        metersRemaining: userPackage.maxMeters === -1 ? -1 : Math.max(0, userPackage.maxMeters - meterCount),
        isAtContractLimit: userPackage.maxContracts !== -1 && contractCount >= userPackage.maxContracts,
        isAtCustomerLimit: userPackage.maxCustomers !== -1 && customerCount >= userPackage.maxCustomers,
        isAtMeterLimit: userPackage.maxMeters !== -1 && meterCount >= userPackage.maxMeters
      }
    };

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Prüfen der Limits',
      error: error.message
    });
  }
};

// Upgrade/Downgrade user package
exports.upgradeUserPackage = async (req, res) => {
  try {
    const { packageName, billingInterval } = req.body;
    const userId = req.user._id;

    if (!billingInterval || !['monthly', 'yearly'].includes(billingInterval)) {
      return res.status(400).json({
        success: false,
        message: 'Bitte wählen Sie ein Zahlungsintervall (monthly oder yearly)'
      });
    }

    const targetPackage = await Package.findOne({ name: packageName });

    if (!targetPackage) {
      return res.status(404).json({
        success: false,
        message: 'Paket nicht gefunden'
      });
    }

    if (!targetPackage.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Dieses Paket ist nicht verfügbar'
      });
    }

    // Get current user package for comparison
    const user = await User.findById(userId);
    const currentPackage = await Package.findOne({ name: user.package });

    // Berechne Preis basierend auf Zahlungsintervall
    const price = targetPackage.calculatePrice(billingInterval);
    const savings = billingInterval === 'yearly' ? targetPackage.yearlySavings : 0;

    // Bei Upgrade: Neues Paket muss gekauft werden
    if (currentPackage && user.subscription && user.subscription.status === 'active') {
      // Wenn aktive Subscription besteht und Upgrade, muss neues Paket gekauft werden
      if (targetPackage.order > currentPackage.order) {
        return res.status(400).json({
          success: false,
          message: 'Für ein Upgrade muss ein neues Paket gekauft werden. Ihre aktuelle Subscription läuft weiter.',
          requiresNewPurchase: true,
          currentPackage: currentPackage.displayName,
          targetPackage: targetPackage.displayName,
          price: price,
          savings: savings,
          billingInterval: billingInterval
        });
      }
    }

    // Check if downgrading and validate usage doesn't exceed new limits
    if (currentPackage && targetPackage.order < currentPackage.order) {
      // Count current usage
      const contractCount = await Contract.countDocuments({ beraterId: userId });

      // Check if current usage exceeds new package limits
      if (targetPackage.maxContracts !== -1 && contractCount > targetPackage.maxContracts) {
        return res.status(400).json({
          success: false,
          message: `Downgrade nicht möglich: Sie haben derzeit ${contractCount} Verträge, aber das ${targetPackage.displayName}-Paket erlaubt nur ${targetPackage.maxContracts} Verträge. Bitte löschen Sie zuerst einige Verträge.`,
          currentUsage: contractCount,
          newLimit: targetPackage.maxContracts
        });
      }
    }

    // Berechne Subscription-Daten basierend auf Verlängerungs-Logik
    const now = new Date();
    let startDate = now;
    let endDate;

    // Prüfe ob es sich um eine Verlängerung des gleichen Pakets handelt
    const isSamePackageRenewal = currentPackage &&
                                  currentPackage.name === targetPackage.name &&
                                  user.subscription?.endDate;

    // Prüfe ob es ein Upgrade ist (höheres Paket)
    const isUpgrade = currentPackage && targetPackage.order > currentPackage.order;

    if (isSamePackageRenewal && !isUpgrade) {
      // Gleiches Paket verlängern: Neues Startdatum = altes Ablaufdatum
      const currentEndDate = new Date(user.subscription.endDate);

      // Wenn das alte Paket noch nicht abgelaufen ist, starte ab dem Ablaufdatum
      if (currentEndDate > now) {
        startDate = currentEndDate;
      }
      // Wenn bereits abgelaufen, starte ab jetzt (startDate bleibt now)
    }
    // Bei Upgrade: Startdatum = sofort (startDate bleibt now)

    // Berechne Enddatum basierend auf Startdatum
    endDate = new Date(startDate);
    if (billingInterval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Update user's package with subscription details
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        package: targetPackage.name,
        packageLimits: {
          maxCustomers: targetPackage.maxCustomers,
          maxContracts: targetPackage.maxContracts,
          maxMeters: targetPackage.maxMeters
        },
        subscription: {
          billingInterval: billingInterval,
          startDate: startDate,
          endDate: endDate,
          lastPaymentDate: now,
          nextPaymentDate: endDate,
          autoRenew: false,
          status: 'active'
        }
      },
      { new: true }
    ).select('-passwordHash');

    // Bestimme die Nachricht
    const isRenewal = isSamePackageRenewal && !isUpgrade;
    const isDowngrade = currentPackage && targetPackage.order < currentPackage.order;
    let action;
    if (isRenewal) {
      action = 'verlängert';
    } else if (isUpgrade) {
      action = 'upgegradet';
    } else if (isDowngrade) {
      action = 'downgegradet';
    } else {
      action = 'gewechselt';
    }

    // Package-Features zum User hinzufügen
    const userWithFeatures = {
      ...updatedUser.toJSON(),
      packageFeatures: targetPackage.features
    };

    // Sende Bestätigungs-E-Mail für Upgrade/Downgrade
    try {
      await sendPackagePurchaseConfirmation(updatedUser, targetPackage, {
        billingInterval: billingInterval,
        startDate: startDate,
        endDate: endDate,
        price: price,
        savings: savings
      });
      console.log(`Paket-Wechsel-Bestätigung gesendet an ${updatedUser.email}`);
    } catch (emailError) {
      console.error('Fehler beim Senden der Paket-Wechsel-Bestätigung:', emailError.message);
    }

    res.json({
      success: true,
      data: userWithFeatures,
      message: `Erfolgreich auf ${targetPackage.displayName} ${action}`,
      subscription: {
        package: targetPackage.displayName,
        billingInterval: billingInterval,
        price: price,
        savings: savings,
        startDate: startDate,
        endDate: endDate,
        isRenewal: isRenewal,
        isUpgrade: isUpgrade
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Paket-Wechsel',
      error: error.message
    });
  }
};

// Purchase package with billing interval
exports.purchasePackage = async (req, res) => {
  try {
    const { packageName, billingInterval } = req.body;
    const userId = req.user._id;

    if (!billingInterval || !['monthly', 'yearly'].includes(billingInterval)) {
      return res.status(400).json({
        success: false,
        message: 'Bitte wählen Sie ein Zahlungsintervall (monthly oder yearly)'
      });
    }

    const targetPackage = await Package.findOne({ name: packageName });

    if (!targetPackage) {
      return res.status(404).json({
        success: false,
        message: 'Paket nicht gefunden'
      });
    }

    if (!targetPackage.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Dieses Paket ist nicht verfügbar'
      });
    }

    const user = await User.findById(userId);
    const currentPackage = await Package.findOne({ name: user.package });

    // Berechne Preis basierend auf Zahlungsintervall
    const price = targetPackage.calculatePrice(billingInterval);
    const savings = billingInterval === 'yearly' ? targetPackage.yearlySavings : 0;

    // Berechne Subscription-Daten basierend auf Verlängerungs-Logik
    const now = new Date();
    let startDate = now;
    let endDate;

    // Prüfe ob es sich um eine Verlängerung des gleichen Pakets handelt
    const isSamePackageRenewal = currentPackage &&
                                  currentPackage.name === targetPackage.name &&
                                  user.subscription?.endDate;

    // Prüfe ob es ein Upgrade ist (höheres Paket)
    const isUpgrade = currentPackage && targetPackage.order > currentPackage.order;

    if (isSamePackageRenewal && !isUpgrade) {
      // Gleiches Paket verlängern: Neues Startdatum = altes Ablaufdatum
      const currentEndDate = new Date(user.subscription.endDate);

      // Wenn das alte Paket noch nicht abgelaufen ist, starte ab dem Ablaufdatum
      if (currentEndDate > now) {
        startDate = currentEndDate;
      }
      // Wenn bereits abgelaufen, starte ab jetzt (startDate bleibt now)
    }
    // Bei Upgrade: Startdatum = sofort (startDate bleibt now)

    // Berechne Enddatum basierend auf Startdatum
    endDate = new Date(startDate);
    if (billingInterval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Update user's package with subscription details
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        package: targetPackage.name,
        packageLimits: {
          maxCustomers: targetPackage.maxCustomers,
          maxContracts: targetPackage.maxContracts,
          maxMeters: targetPackage.maxMeters
        },
        subscription: {
          billingInterval: billingInterval,
          startDate: startDate,
          endDate: endDate,
          lastPaymentDate: now,
          nextPaymentDate: endDate,
          autoRenew: false,
          status: 'active'
        }
      },
      { new: true }
    ).select('-passwordHash');

    // Package-Features zum User hinzufügen
    const userWithFeatures = {
      ...updatedUser.toJSON(),
      packageFeatures: targetPackage.features
    };

    // Bestimme die Nachricht basierend auf der Art des Kaufs
    const isRenewal = isSamePackageRenewal && !isUpgrade;
    const message = isRenewal
      ? `${targetPackage.displayName} erfolgreich verlängert`
      : isUpgrade
        ? `Erfolgreich auf ${targetPackage.displayName} upgegradet`
        : `${targetPackage.displayName} erfolgreich gekauft`;

    // Sende Bestätigungs-E-Mail
    try {
      await sendPackagePurchaseConfirmation(updatedUser, targetPackage, {
        billingInterval: billingInterval,
        startDate: startDate,
        endDate: endDate,
        price: price,
        savings: savings
      });
      console.log(`Paket-Kauf-Bestätigung gesendet an ${updatedUser.email}`);
    } catch (emailError) {
      console.error('Fehler beim Senden der Paket-Kauf-Bestätigung:', emailError.message);
      // Fehler beim E-Mail-Versand sollte den Kauf nicht beeinflussen
    }

    res.json({
      success: true,
      data: userWithFeatures,
      message: message,
      subscription: {
        package: targetPackage.displayName,
        billingInterval: billingInterval,
        billingIntervalText: billingInterval === 'yearly' ? 'Jährlich' : 'Monatlich',
        price: price,
        savings: savings,
        startDate: startDate,
        endDate: endDate,
        isRenewal: isRenewal,
        isUpgrade: isUpgrade,
        priceDetails: {
          monthlyPrice: targetPackage.monthlyPrice,
          yearlyPrice: targetPackage.yearlyPrice,
          totalPaid: price,
          currency: targetPackage.currency
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Paket-Kauf',
      error: error.message
    });
  }
};

// Get subscription info
exports.getSubscriptionInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    const userPackage = await Package.findOne({ name: user.package });

    if (!userPackage) {
      return res.status(404).json({
        success: false,
        message: 'Paket nicht gefunden'
      });
    }

    const subscription = user.subscription || {};
    const billingInterval = subscription.billingInterval || 'monthly';
    const currentPrice = userPackage.calculatePrice(billingInterval);
    const savings = billingInterval === 'yearly' ? userPackage.yearlySavings : 0;

    res.json({
      success: true,
      data: {
        package: {
          name: userPackage.name,
          displayName: userPackage.displayName,
          description: userPackage.description,
          monthlyPrice: userPackage.monthlyPrice,
          yearlyPrice: userPackage.yearlyPrice,
          currency: userPackage.currency
        },
        subscription: {
          billingInterval: billingInterval,
          billingIntervalText: billingInterval === 'yearly' ? 'Jährlich' : 'Monatlich',
          currentPrice: currentPrice,
          savings: savings,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          nextPaymentDate: subscription.nextPaymentDate,
          autoRenew: false,
          status: subscription.status || 'active'
        },
        limits: {
          maxCustomers: userPackage.maxCustomers,
          maxContracts: userPackage.maxContracts,
          maxMeters: userPackage.maxMeters
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Subscription-Informationen',
      error: error.message
    });
  }
};
