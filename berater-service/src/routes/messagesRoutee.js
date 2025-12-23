const express = require('express');
const router = express.Router();

const {
  getMessagesByConversation,
  sendMessage,
  markConversationAsRead,
  getUnreadCount,
  getConversations
} = require('../controllers/messageController');

const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/**
 * 📥 Alle Konversationen des Users/Admin
 */
router.get('/conversations', getConversations);

/**
 * 📊 Anzahl ungelesener Nachrichten
 */
router.get('/unread/count', getUnreadCount);

/**
 * 📥 Nachrichten einer Konversation
 */
router.get('/:conversationId', getMessagesByConversation);

/**
 * 📤 Nachricht senden
 */
router.post('/', sendMessage);

/**
 * 👁️ Konversation als gelesen markieren
 */
router.patch('/read/:conversationId', markConversationAsRead);

module.exports = router;
