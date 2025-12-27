import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessagesService } from 'src/app/services/messages.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { UnreadMessagesService } from 'src/app/services/unread-messages.service';
import { Message } from 'src/app/models/message.model';
import { ViewportService } from 'src/app/services/viewport.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesMobileComponent } from './messages-mobile/messages-mobile.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-messages',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.scss'],
    imports:[CommonModule, FormsModule, MessagesMobileComponent],
    standalone: true
})
export class MessagesComponent implements OnInit, OnDestroy {

  conversationId!: string;
  currentUserId!: string;
  currentRole!: 'admin' | 'user';

  messages: Message[] = [];
  messageText = '';
  loading = false;
  conversations: any[] = [];
  selectedConversation: any;
  currentUser = { _id: 'user123', role: 'user' };
  receiverId!: string;
  users: { _id: string, name: string, address?: string }[] = [];
  selectedUserId = '';
  showUserPicker = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  showImageViewer = false;
  viewingImageUrl = '';

  // WebSocket Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private messagesService: MessagesService,
    private viewportService: ViewportService,
    private wsService: WebsocketService,
    private unreadMessagesService: UnreadMessagesService
  ) { }

  ngOnInit(): void {
    this.loadUsers()
    if (localStorage.getItem('user')) {
      this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      this.currentUserId = this.currentUser._id;
    }
    this.loadConversations();
    this.initializeWebSocket();
  }

  ngOnDestroy(): void {
    // Alle Subscriptions beenden
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // WebSocket Verbindung trennen
    this.wsService.disconnect();
  }

  /**
   * WebSocket initialisieren und Event-Listener einrichten
   */
  private initializeWebSocket(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, cannot connect to WebSocket');
      return;
    }

    // WebSocket Verbindung herstellen
    this.wsService.connect(token);

    // Neue Nachrichten empfangen
    const newMessageSub = this.wsService.newMessage$.subscribe((message: Message) => {
      // Nur Nachrichten der aktuellen Conversation hinzufügen
      if (message.conversationId === this.conversationId) {
        // Duplikate vermeiden
        const exists = this.messages.find(m => m._id === message._id);
        if (!exists) {
          this.messages.push(message);
          this.scrollToBottom();

          // Automatisch als gelesen markieren wenn User im Chat ist
          if (message.receiverId === this.currentUserId) {
            this.markAsRead();
          }
        }
      }
      // Conversation-Liste aktualisieren
      this.loadConversations();
    });

    // Nachrichtenbenachrichtigung
    const notificationSub = this.wsService.messageNotification$.subscribe((data: any) => {
      console.log('Neue Nachricht erhalten:', data);
      // Conversation-Liste aktualisieren für Badge-Anzahl
      this.loadConversations();
      // Unread count aktualisieren
      this.unreadMessagesService.updateUnreadCount();
    });

    // Nachrichten als gelesen markiert
    const readSub = this.wsService.messagesRead$.subscribe((data: any) => {
      if (data.conversationId === this.conversationId) {
        // Nachrichten als gelesen markieren
        this.messages.forEach(msg => {
          if (data.messageIds.includes(msg._id)) {
            msg.readAt = data.readAt;
          }
        });
      }
    });

    this.subscriptions.push(newMessageSub, notificationSub, readSub);
  }

  get isMobile(): boolean {
    return this.viewportService.isMobile();
  }


  loadMessages(): void {
    this.loading = true;
    this.messagesService.getMessages(this.conversationId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.loading = false;
        this.markAsRead();
        this.scrollToBottom();
      },
      error: () => this.loading = false
    });
  }

  sendMessage(): void {
    if (!this.messageText.trim() && !this.selectedImage) return;
    if (!this.conversationId || !this.receiverId) return;

    // Wenn WebSocket verbunden ist, über WebSocket senden
    if (this.wsService.isConnected() && !this.selectedImage) {
      this.wsService.sendMessage({
        conversationId: this.conversationId,
        receiverId: this.receiverId,
        text: this.messageText
      });
      this.messageText = '';
    } else {
      // Fallback auf HTTP (z.B. für Bilder oder wenn WebSocket nicht verbunden)
      this.messagesService
        .sendMessage(this.conversationId, this.receiverId, this.messageText, this.selectedImage || undefined)
        .subscribe({
          next: msg => {
            // Nachricht wird über WebSocket-Event empfangen
            this.messageText = '';
            this.selectedImage = null;
            this.imagePreview = null;
          }
        });
    }
  }

  onImageSelect(event: any): void {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedImage = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  openImageViewer(imageUrl: string): void {
    this.viewingImageUrl = imageUrl;
    this.showImageViewer = true;
  }

  closeImageViewer(): void {
    this.showImageViewer = false;
    this.viewingImageUrl = '';
  }

  getFullImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    // Wenn die URL schon vollständig ist, zurückgeben
    if (imageUrl.startsWith('http')) return imageUrl;
    // Ansonsten Backend-URL hinzufügen
    return `http://localhost:3000${imageUrl}`;
  }

  onKeyDown(event: any): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  markAsRead(): void {
    if (!this.conversationId) return;

    // Ungelesene Nachrichten finden
    const unreadMessages = this.messages.filter(
      msg => msg.receiverId === this.currentUserId && !msg.readAt
    );

    if (unreadMessages.length === 0) return;

    // Über HTTP API als gelesen markieren
    this.messagesService.markAsRead(this.conversationId).subscribe(() => {
      // Unread count aktualisieren nach als gelesen markieren
      this.unreadMessagesService.updateUnreadCount();
    });

    // Zusätzlich über WebSocket informieren (für Echtzeit-Updates beim Sender)
    if (this.wsService.isConnected()) {
      const messageIds = unreadMessages.map(msg => msg._id);
      this.wsService.markAsRead(this.conversationId, messageIds);
    }
  }

  private getReceiverId(): string {
    const last = this.messages[this.messages.length - 1];
    return last
      ? (last.senderId === this.currentUserId ? last.receiverId : last.senderId)
      : '';
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = document.querySelector('.chat-messages');
      el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }

  loadConversations(): void {
    this.messagesService.getConversations().subscribe({
      next: (convs) => {
        this.conversations = convs;
      },
      error: (err) => console.error(err)
    });
  }

  selectConversation(conv: any): void {
    this.selectedConversation = conv;
    this.conversationId = conv._id;
    this.receiverId = conv.otherUserId; // 🔥 wichtig
    this.loadMessages();

    // WebSocket: Conversation beitreten
    if (this.wsService.isConnected()) {
      this.wsService.joinConversations([this.conversationId]);
    }
  }

startConversation(receiverId: string) {
  this.showUserPicker = false; // Popup schließen

  this.messagesService.createConversation(receiverId).subscribe({
    next: (conv) => {
      this.selectedConversation = conv;
      this.conversationId = conv._id;
      this.receiverId = conv.otherUserId;

      // Nachricht optional sofort senden
      if (this.messageText.trim()) {
        this.sendMessage();
      }

      // Reload der Conversations
      this.loadConversations();
    },
    error: (err) => console.error('Fehler beim Erstellen der Conversation:', err)
  });
}

  loadUsers(): void {
    this.messagesService.loadUsers().subscribe({
      next: (users) => {
          this.users = users;
      },
      error: (err) => console.error('Fehler beim Laden der User:', err)
    });
  }

  selectUser(userId: string) {
    this.selectedUserId = userId;
  }
}
