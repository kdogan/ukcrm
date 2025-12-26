const express = require('express');
const router = express.Router();

const {
  getMessagesByConversation,
  sendMessage,
  markConversationAsRead,
  getUnreadCount,
  getConversations,
  createConversation
} = require('../controllers/messageController');

const { authenticate } = require('../middleware/auth');
const { uploadMessageImage } = require('../middleware/upload');

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
router.post('/', uploadMessageImage.single('image'), sendMessage);

/**
 * 👁️ Konversation als gelesen markieren
 */
router.patch('/read/:conversationId', markConversationAsRead);

router.post('/conversations', createConversation);

module.exports = router;
