export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'admin' | 'user';
  receiverId: string;
  text: string;
  createdAt: string;
  readAt?: string | null;
}
