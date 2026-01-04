const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Package = require('../models/Package');

const connectDB = async () => {
  try {
    console.log('🔌 Verbinde zu MongoDB...:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB verbunden\n');
  } catch (error) {
    console.error('❌ MongoDB Fehler:', error);
    process.exit(1);
  }
};

const migrateBasicToFree = async () => {
  try {
    console.log('🔄 Starte Migration: Basic → Kostenlos\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Free-Paket aus der Datenbank holen
    const freePackage = await Package.findOne({ name: 'free' });

    if (!freePackage) {
      console.error('❌ Free-Paket nicht gefunden in der Datenbank!');
      console.log('💡 Bitte stellen Sie sicher, dass das "free"-Paket existiert.');
      process.exit(1);
    }

    console.log('✅ Free-Paket gefunden:');
    console.log(`   - Name: ${freePackage.displayName}`);
    console.log(`   - Max Kunden: ${freePackage.maxCustomers}`);
    console.log(`   - Max Verträge: ${freePackage.maxContracts}`);
    console.log(`   - Max Zähler: ${freePackage.maxMeters}`);
    console.log(`   - Preis: ${freePackage.monthlyPrice} ${freePackage.currency}\n`);

    // 2. Alle Berater mit Basic-Paket finden
    const basicUsers = await User.find({
      package: 'basic',
      role: 'berater'
    });

    console.log(`📊 Gefundene Berater mit Basic-Paket: ${basicUsers.length}\n`);

    if (basicUsers.length === 0) {
      console.log('✨ Keine Berater mit Basic-Paket gefunden. Migration nicht erforderlich.');
      process.exit(0);
    }

    // 3. Zeige Liste der betroffenen Berater
    console.log('👥 Betroffene Berater:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    basicUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Aktuelle Limits: ${user.packageLimits?.maxCustomers || 'N/A'} Kunden, ${user.packageLimits?.maxContracts || 'N/A'} Verträge, ${user.packageLimits?.maxMeters || 'N/A'} Zähler`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 4. Migration durchführen
    const newPackageLimits = {
      maxCustomers: freePackage.maxCustomers,
      maxContracts: freePackage.maxContracts,
      maxMeters: freePackage.maxMeters
    };

    const updateResult = await User.updateMany(
      {
        package: 'basic',
        role: 'berater'
      },
      {
        $set: {
          package: 'free',
          packageLimits: newPackageLimits
        }
      }
    );

    console.log('✅ Migration abgeschlossen!\n');
    console.log('📈 Ergebnis:');
    console.log(`   - Aktualisierte Berater: ${updateResult.modifiedCount}`);
    console.log(`   - Neues Paket: Kostenlos (free)`);
    console.log(`   - Neue Limits: ${newPackageLimits.maxCustomers} Kunden, ${newPackageLimits.maxContracts} Verträge, ${newPackageLimits.maxMeters} Zähler\n`);

    // 5. Verifizierung
    const verifyCount = await User.countDocuments({
      package: 'free',
      role: 'berater'
    });

    console.log(`✅ Verifizierung: ${verifyCount} Berater haben jetzt das kostenlose Paket\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Migration erfolgreich abgeschlossen!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fehler bei der Migration:', error);
    process.exit(1);
  }
};

// Ausführen
connectDB().then(migrateBasicToFree);
