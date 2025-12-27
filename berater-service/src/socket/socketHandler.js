const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Map um User-IDs zu Socket-IDs zu speichern
const userSockets = new Map();

/**
 * Socket.io Handler für Echtzeit-Nachrichten
 */
module.exports = (io) => {
  // Authentifizierung bei Verbindung
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Token verifizieren
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.user = decoded;

      next();
    } catch (err) {
      console.error('Socket auth error:', err);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`✅ User ${userId} connected (Socket: ${socket.id})`);

    // User Socket-ID speichern
    userSockets.set(userId.toString(), socket.id);

    // User tritt seinen Conversations bei
    socket.on('join-conversations', async (conversationIds) => {
      try {
        if (Array.isArray(conversationIds)) {
          conversationIds.forEach(convId => {
            socket.join(`conversation:${convId}`);
          });
          console.log(`User ${userId} joined ${conversationIds.length} conversations`);
        }
      } catch (err) {
        console.error('Error joining conversations:', err);
      }
    });

    // Neue Nachricht senden
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, receiverId, text, imageUrl, imageName } = data;

        // Nachricht in DB speichern
        const messageData = {
          conversationId,
          senderId: userId,
          receiverId,
          text: text || '',
          imageUrl: imageUrl || null,
          imageName: imageName || null
        };

        const message = await Message.create(messageData);

        // Nachricht an Conversation-Room senden
        io.to(`conversation:${conversationId}`).emit('new-message', {
          ...message.toObject(),
          _id: message._id.toString()
        });

        // Zusätzlich direkt an Empfänger senden (falls online)
        const receiverSocketId = userSockets.get(receiverId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message-notification', {
            conversationId,
            message: {
              ...message.toObject(),
              _id: message._id.toString()
            }
          });
        }

        // Conversation updaten
        await Conversation.findByIdAndUpdate(
          conversationId,
          { updatedAt: new Date() }
        );

        console.log(`📨 Message sent in conversation ${conversationId}`);
      } catch (err) {
        console.error('Error sending message:', err);
        socket.emit('message-error', { error: err.message });
      }
    });

    // Nachricht als gelesen markieren
    socket.on('mark-as-read', async (data) => {
      try {
        const { conversationId, messageIds } = data;

        await Message.updateMany(
          {
            _id: { $in: messageIds },
            receiverId: userId,
            readAt: null
          },
          { $set: { readAt: new Date() } }
        );

        // Allen in der Conversation mitteilen
        io.to(`conversation:${conversationId}`).emit('messages-read', {
          conversationId,
          messageIds,
          readBy: userId,
          readAt: new Date()
        });

        console.log(`✅ Messages marked as read in conversation ${conversationId}`);
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    });

    // Typing-Indikator
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      socket.to(`conversation:${conversationId}`).emit('user-typing', {
        conversationId,
        userId,
        isTyping
      });
    });

    // Disconnection
    socket.on('disconnect', () => {
      userSockets.delete(userId.toString());
      console.log(`❌ User ${userId} disconnected (Socket: ${socket.id})`);
    });

    // Error handling
    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });

  return io;
};
