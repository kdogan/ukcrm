const Message = require('../models/Message');

/**
 * 📥 Alle Konversationen
 */
exports.getConversations = async (req, res) => {
  const userId = req.user.id;

  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $last: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$readAt', null] }] },
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { 'lastMessage.createdAt': -1 } }
  ]);

  res.json(conversations);
};

/**
 * 📥 Nachrichten einer Konversation
 */
exports.getMessagesByConversation = async (req, res) => {
  const { conversationId } = req.params;

  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 });

  res.json(messages);
};

/**
 * 📤 Nachricht senden
 */
exports.sendMessage = async (req, res) => {
  const senderId = req.user.id;
  const { conversationId, receiverId, text } = req.body;

  const message = await Message.create({
    conversationId,
    senderId,
    receiverId,
    text
  });

  res.status(201).json(message);
};

/**
 * 👁️ Als gelesen markieren
 */
exports.markConversationAsRead = async (req, res) => {
  const userId = req.user.id;
  const { conversationId } = req.params;

  await Message.updateMany(
    {
      conversationId,
      receiverId: userId,
      readAt: null
    },
    { $set: { readAt: new Date() } }
  );

  res.json({ success: true });
};

/**
 * 📊 Ungelesene Nachrichten zählen
 */
exports.getUnreadCount = async (req, res) => {
  const userId = req.user.id;

  const count = await Message.countDocuments({
    receiverId: userId,
    readAt: null
  });

  res.json({ count });
};
