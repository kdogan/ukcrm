require('dotenv').config();
const mongoose = require('mongoose');

// ⬇️ Models importieren
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// ⬇️ IDs (von dir)
const SUPERADMIN_ID = '6946935d40b04c1f0f2024e4';
const BERATER_ID    = '6946935d40b04c1f0f2024e0';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB verbunden');
  } catch (error) {
    console.error('MongoDB Fehler:', error);
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
connectDB().then(seedMessages);
