export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'admin' | 'user';
  receiverId: string;
  text: string;
  imageUrl?: string;
  imageName?: string;
  createdAt: string;
  readAt?: string | null;
}
