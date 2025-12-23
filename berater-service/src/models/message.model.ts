import { Schema, model, Types } from 'mongoose';

export type MessageRole = 'admin' | 'user';

const MessageSchema = new Schema(
  {
    conversationId: {
      type: Types.ObjectId,
      required: true,
      index: true
    },

    senderId: {
      type: Types.ObjectId,
      required: true
    },

    senderRole: {
      type: String,
      enum: ['admin', 'user'],
      required: true
    },

    receiverId: {
      type: Types.ObjectId,
      required: true
    },

    text: {
      type: String,
      required: true,
      trim: true
    },

    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
);

export const Message = model('Message', MessageSchema);
