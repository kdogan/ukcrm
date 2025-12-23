require('dotenv').config();
const mongoose = require('mongoose');

// Models
const User = require('../models/User');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Meter = require('../models/Meter');
const Contract = require('../models/Contract');
const Package = require('../models/Package');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const connectDB = async () => {
  try {
    console.log('🔌 Verbinde zu MongoDB... :', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB verbunden');
  } catch (error) {
    console.error('MongoDB Fehler:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    seedMessages()
return;
    // Lösche vorhandene Daten
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Supplier.deleteMany({});
    await Meter.deleteMany({});
    await Contract.deleteMany({});
    await Package.deleteMany({});

    console.log('Vorhandene Daten gelöscht');

    // Erstelle Pakete
    const packages = await Package.insertMany([
      {
        name: 'free',
        displayName: 'Kostenlos',
        maxContracts: 10,
        maxCustomers: 10,
        maxMeters: 10,
        price: 0,
        currency: 'EUR',
        billingPeriod: 'monthly',
        isActive: true,
        isFree: true,
        order: 1
      },
      {
        name: 'basic',
        displayName: 'Basic',
        maxContracts: 50,
        maxCustomers: 50,
        maxMeters: 50,
        price: 29.99,
        currency: 'EUR',
        billingPeriod: 'monthly',
        isActive: true,
        isFree: false,
        order: 2
      },
      {
        name: 'professional',
        displayName: 'Professional',
        maxContracts: 200,
        maxCustomers: 200,
        maxMeters: 200,
        price: 79.99,
        currency: 'EUR',
        billingPeriod: 'monthly',
        isActive: true,
        isFree: false,
        order: 3
      },
      {
        name: 'enterprise',
        displayName: 'Enterprise',
        maxContracts: -1, // unlimited
        maxCustomers: -1,
        maxMeters: -1,
        price: 199.99,
        currency: 'EUR',
        billingPeriod: 'monthly',
        isActive: true,
        isFree: false,
        order: 4
      }
    ]);

    console.log('✓ Pakete erstellt:', packages.length);

    // Erstelle Berater (Passwort wird automatisch gehasht durch pre-save hook)
    const berater = await User.create({
      email: 'berater@example.com',
      passwordHash: 'Berater123!',
      firstName: 'Max',
      lastName: 'Mustermann',
      phone: '+49 123 456789',
      role: 'berater',
      package: 'free',
      isActive: true,
      emailNotifications: true
    });

    console.log('✓ Berater erstellt:', berater.email);

    // Erstelle Admin (Passwort wird automatisch gehasht durch pre-save hook)
    const admin = await User.create({
      email: 'admin@example.com',
      passwordHash: 'Admin123!',
      firstName: 'Anna',
      lastName: 'Admin',
      phone: '+49 987 654321',
      role: 'admin',
      package: 'professional',
      isActive: true
    });

    console.log('✓ Admin erstellt:', admin.email);

    // Erstelle Superadmin (Passwort wird automatisch gehasht durch pre-save hook)
    const superadmin = await User.create({
      email: 'superadmin@example.com',
      passwordHash: 'Super123!',
      firstName: 'Super',
      lastName: 'Administrator',
      phone: '+49 800 999999',
      role: 'superadmin',
      package: 'enterprise',
      isActive: true,
      packageLimits: {
        maxCustomers: -1, // unlimited
        maxContracts: -1,
        maxMeters: -1
      }
    });

    console.log('✓ Superadmin erstellt:', superadmin.email);

    // Erstelle Anbieter
    const suppliers = await Supplier.insertMany([
      {
        name: 'E.ON Energie Deutschland',
        shortName: 'E.ON',
        contactEmail: 'kontakt@eon.de',
        contactPhone: '+49 800 1234567',
        isActive: true
      },
      {
        name: 'Vattenfall GmbH',
        shortName: 'Vattenfall',
        contactEmail: 'service@vattenfall.de',
        contactPhone: '+49 800 9876543',
        isActive: true
      },
      {
        name: 'EnBW Energie Baden-Württemberg',
        shortName: 'EnBW',
        contactEmail: 'info@enbw.com',
        contactPhone: '+49 721 63000',
        isActive: true
      }
    ]);

    console.log('✓ Anbieter erstellt:', suppliers.length);

    // Erstelle Kunden
    const customers = await Customer.insertMany([
      {
        beraterId: berater._id,
        customerNumber: 'K-2024-001',
        firstName: 'Hans',
        lastName: 'Schmidt',
        email: 'hans.schmidt@email.de',
        phone: '+49 151 11111111',
        address: {
          street: 'Hauptstraße 1',
          zip: '76571',
          city: 'Gaggenau',
          country: 'Deutschland'
        },
        isActive: true,
        auditLog: [{
          userId: berater._id,
          action: 'created',
          timestamp: new Date()
        }]
      },
      {
        beraterId: berater._id,
        customerNumber: 'K-2024-002',
        firstName: 'Maria',
        lastName: 'Müller',
        email: 'maria.mueller@email.de',
        phone: '+49 152 22222222',
        address: {
          street: 'Gartenweg 15',
          zip: '76571',
          city: 'Gaggenau',
          country: 'Deutschland'
        },
        notes: 'Wichtiger Großkunde',
        isActive: true,
        auditLog: [{
          userId: berater._id,
          action: 'created',
          timestamp: new Date()
        }]
      },
      {
        beraterId: berater._id,
        customerNumber: 'K-2024-003',
        firstName: 'Thomas',
        lastName: 'Weber',
        email: 'thomas.weber@email.de',
        phone: '+49 153 33333333',
        address: {
          street: 'Waldstraße 42',
          zip: '76571',
          city: 'Gaggenau',
          country: 'Deutschland'
        },
        isActive: true,
        auditLog: [{
          userId: berater._id,
          action: 'created',
          timestamp: new Date()
        }]
      }
    ]);

    console.log('✓ Kunden erstellt:', customers.length);

    // Erstelle Zähler
    const meters = await Meter.insertMany([
      {
        beraterId: berater._id,
        meterNumber: 'Z-2024-001',
        type: 'electricity',
        location: {
          street: 'Hauptstraße 1',
          zip: '76571',
          city: 'Gaggenau'
        },
        manufacturer: 'Siemens',
        yearBuilt: 2020,
        currentCustomerId: customers[0]._id
      },
      {
        beraterId: berater._id,
        meterNumber: 'Z-2024-002',
        type: 'gas',
        location: {
          street: 'Gartenweg 15',
          zip: '76571',
          city: 'Gaggenau'
        },
        manufacturer: 'Elster',
        yearBuilt: 2019,
        currentCustomerId: customers[1]._id
      },
      {
        beraterId: berater._id,
        meterNumber: 'Z-2024-003',
        type: 'electricity',
        location: {
          street: 'Waldstraße 42',
          zip: '76571',
          city: 'Gaggenau'
        },
        manufacturer: 'Siemens',
        yearBuilt: 2021,
        currentCustomerId: null // Frei
      }
    ]);

    console.log('✓ Zähler erstellt:', meters.length);

    // Erstelle Verträge
    const contract1Start = new Date('2024-01-01');
    const contract1End = new Date(contract1Start);
    contract1End.setMonth(contract1End.getMonth() + 12);

    const contract2Start = new Date('2023-06-01');
    const contract2End = new Date(contract2Start);
    contract2End.setMonth(contract2End.getMonth() + 24);

    await Contract.insertMany([
      {
        beraterId: berater._id,
        contractNumber: 'V-2024-001',
        customerId: customers[0]._id,
        meterId: meters[0]._id,
        supplierId: suppliers[0]._id,
        startDate: contract1Start,
        endDate: contract1End,
        durationMonths: 12,
        status: 'active',
        notes: 'Standard-Vertrag',
        auditLog: [{
          userId: berater._id,
          action: 'created',
          timestamp: new Date()
        }]
      },
      {
        beraterId: berater._id,
        contractNumber: 'V-2023-002',
        customerId: customers[1]._id,
        meterId: meters[1]._id,
        supplierId: suppliers[1]._id,
        startDate: contract2Start,
        endDate: contract2End,
        durationMonths: 24,
        status: 'active',
        notes: 'Langzeit-Vertrag mit Sonderkonditionen',
        auditLog: [{
          userId: berater._id,
          action: 'created',
          timestamp: new Date()
        }]
      }
    ]);

    console.log('✓ Verträge erstellt');

    console.log('\n========================================');
    console.log('Seeding erfolgreich abgeschlossen!');
    console.log('========================================');
    console.log('\nLogin-Daten:');
    console.log('Berater:    berater@example.com / Berater123!');
    console.log('Admin:      admin@example.com / Admin123!');
    console.log('Superadmin: superadmin@example.com / Super123!');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Fehler:', error);
    process.exit(1);
  }
};

async function seedMessages() {
    const SUPERADMIN_ID = '6946935d40b04c1f0f2024e4';
const BERATER_ID    = '6946935d40b04c1f0f2024e0';
  try {
    // 🔎 Prüfen ob Conversation schon existiert
    let conversation = await Conversation.findOne({
      participants: { $all: [SUPERADMIN_ID, BERATER_ID] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [SUPERADMIN_ID, BERATER_ID],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('🗨️ Conversation erstellt:', conversation._id);
    } else {
      console.log('ℹ️ Conversation existiert bereits:', conversation._id);
    }

    // ✉️ Nachrichten erstellen
    const messages = await Message.insertMany([
      {
        conversationId: conversation._id,
        senderId: SUPERADMIN_ID,
        receiverId: BERATER_ID,
        senderRole: 'admin',
        text: 'Hallo 👋 Willkommen bei Eskapp!',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 10)
      },
      {
        conversationId: conversation._id,
        senderId: BERATER_ID,
        receiverId: SUPERADMIN_ID,
        senderRole: 'user',
        text: 'Danke! Ich habe eine Frage zu Verträgen.',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 7)
      },
      {
        conversationId: conversation._id,
        senderId: SUPERADMIN_ID,
        receiverId: BERATER_ID,
        senderRole: 'admin',
        text: 'Kein Problem 🙂 Was genau?',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5)
      }
    ]);

    // 🔄 Conversation updaten
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: messages[messages.length - 1]._id,
      updatedAt: new Date()
    });

    console.log('✅ Nachrichten erfolgreich angelegt');
    process.exit(0);
  } catch (err) {
    console.error('❌ Fehler beim Seeden:', err);
    process.exit(1);
  }
}

// Ausführen
connectDB().then(seedDatabase);
