const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

/**
 * 📥 Alle Konversationen
 */
const mongoose = require('mongoose');

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.aggregate([
      {
        $match: {
          participants: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: 'messages',
          let: { convId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$conversationId', '$$convId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: 'lastMessage'
        }
      },
      { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          otherUserId: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$participants',
                  cond: { $ne: ['$$this', new mongoose.Types.ObjectId(userId)] }
                }
              },
              0
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { otherId: '$otherUserId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$otherId'] } } },
            {
              $project: {
                _id: 1,
                name: { $concat: ['$firstName', ' ', '$lastName'] }
              }
            }
          ],
          as: 'otherUser'
        }
      },
      { $unwind: { path: '$otherUser', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          otherUserId: '$otherUser._id',
          otherUserName: '$otherUser.name',
          unreadCount: {
            $size: {
              $filter: {
                input: '$lastMessage' ? ['$lastMessage'] : [],
                cond: { $eq: ['$$this.read', false] }
              }
            }
          }
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    res.json(conversations);
  } catch (err) {
    console.error('Fehler beim Laden der Conversations:', err);
    res.status(500).json({ message: 'Fehler beim Laden der Conversations' });
  }
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

exports.createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    // Prüfen ob Conversation schon existiert
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Optionally: populate otherUser info
    const otherUserId = conversation.participants.find(p => p.toString() !== senderId.toString());
    const otherUser = await User.findById(otherUserId).select('_id firstName lastName');
    const otherUserName = `${otherUser.firstName} ${otherUser.lastName}`;

    res.json({
      _id: conversation._id,
      otherUserId,
      otherUserName
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Erstellen der Conversation' });
  }
};

