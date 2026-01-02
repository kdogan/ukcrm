require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB verbunden');
  } catch (error) {
    console.error('✗ MongoDB Verbindungsfehler:', error);
    process.exit(1);
  }
};

// WICHTIG: Diese Passwörter werden beim Speichern automatisch gehashed
// ALLE Test-User verwenden das gleiche Passwort: Start1234!
const testUsers = [
  {
    email: 'superadmin@eskapp.com',
    passwordHash: 'Start1234!', // Passwort: Start1234!
    firstName: 'Super',
    lastName: 'Admin',
    role: 'superadmin',
    isActive: true,
    isEmailVerified: true
  },
  {
    email: 'mitarbeiter@firmaX.com',
    passwordHash: 'Start1234!', // Passwort: Start1234!
    firstName: 'Max',
    lastName: 'Muster',
    role: 'admin',
    isActive: true,
    isEmailVerified: true
  },
  {
    email: 'mitarbeiter2@firmaX.com',
    passwordHash: 'Start1234!', // Passwort: Start1234!
    firstName: 'Max',
    lastName: 'Muster',
    role: 'berater',
    isActive: true,
    isEmailVerified: true
  }
];

const seedTestUsers = async () => {
  try {
    await connectDB();

    console.log('\n🌱 Erstelle/Aktualisiere Test-Benutzer für Development...\n');

    for (const userData of testUsers) {
      // Prüfe ob User bereits existiert
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        // User existiert bereits - aktualisiere das Passwort
        existingUser.passwordHash = userData.passwordHash;
        existingUser.isActive = true;
        existingUser.isEmailVerified = true;
        await existingUser.save();
        console.log(`🔄 ${userData.email} aktualisiert (Passwort: Start1234!)`);
      } else {
        // User erstellen
        await User.create(userData);
        console.log(`✅ ${userData.email} erstellt (${userData.role})`);
      }
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('Test-Benutzer erfolgreich erstellt!');
    console.log('═══════════════════════════════════════════════');
    console.log('\nLogin-Daten:');
    console.log('───────────────────────────────────────────────');
    testUsers.forEach(user => {
      const roleName = user.role === 'superadmin' ? 'Superadmin' :
                       user.role === 'admin' ? 'Admin' : 'Mitarbeiter';
      console.log(`\n${user.firstName} ${user.lastName} (${roleName})`);
      console.log(`  Email:    ${user.email}`);
      console.log(`  Passwort: ${user.passwordHash}`);
    });
    console.log('\n═══════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Fehler beim Erstellen der Test-User:', error.message);
    process.exit(1);
  }
};

seedTestUsers();
