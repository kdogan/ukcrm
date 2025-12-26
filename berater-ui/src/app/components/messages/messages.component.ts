import { Component, OnInit } from '@angular/core';
import { MessagesService } from 'src/app/services/messages.service';
import { Message } from 'src/app/models/message.model';
import { ViewportService } from 'src/app/services/viewport.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesMobileComponent } from './messages-mobile/messages-mobile.component';

@Component({
    selector: 'app-messages',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.scss'],
    imports:[CommonModule, FormsModule, MessagesMobileComponent],
    standalone: true
})
export class MessagesComponent implements OnInit {

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

  constructor(private messagesService: MessagesService, private viewportService: ViewportService) { }

  ngOnInit(): void {
    this.loadUsers()
    if (localStorage.getItem('user')) {
      this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      this.currentUserId = this.currentUser._id;
    }
    this.loadConversations();
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
    if (!this.messageText.trim()) return;
    if (!this.conversationId || !this.receiverId) return;

    this.messagesService
      .sendMessage(this.conversationId, this.receiverId, this.messageText)
      .subscribe({
        next: msg => {
          this.messages.push(msg);
          this.messageText = '';
          this.scrollToBottom();
        }
      });
  }

  markAsRead(): void {
    this.messagesService.markAsRead(this.conversationId).subscribe();
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
