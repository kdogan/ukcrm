import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket | null = null;
  private connected = false;

  // Observables für verschiedene Events
  private newMessageSubject = new Subject<any>();
  private messageNotificationSubject = new Subject<any>();
  private messagesReadSubject = new Subject<any>();
  private userTypingSubject = new Subject<any>();
  private connectionStatusSubject = new Subject<boolean>();

  public newMessage$ = this.newMessageSubject.asObservable();
  public messageNotification$ = this.messageNotificationSubject.asObservable();
  public messagesRead$ = this.messagesReadSubject.asObservable();
  public userTyping$ = this.userTypingSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor() {}

  /**
   * Verbindung zum WebSocket Server herstellen
   */
  connect(token: string): void {
    if (this.connected && this.socket) {
      console.log('WebSocket already connected');
      return;
    }

    const socketUrl = environment.apiUrl.replace('/api', '');

    this.socket = io(socketUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupEventListeners();
  }

  /**
   * Event Listeners einrichten
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.connected = true;
      this.connectionStatusSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      this.connected = false;
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.connected = false;
      this.connectionStatusSubject.next(false);
    });

    // Neue Nachricht empfangen
    this.socket.on('new-message', (message: any) => {
      console.log('📨 New message received:', message);
      this.newMessageSubject.next(message);
    });

    // Nachrichtenbenachrichtigung
    this.socket.on('message-notification', (data: any) => {
      console.log('🔔 Message notification:', data);
      this.messageNotificationSubject.next(data);
    });

    // Nachrichten als gelesen markiert
    this.socket.on('messages-read', (data: any) => {
      console.log('✅ Messages read:', data);
      this.messagesReadSubject.next(data);
    });

    // User tippt
    this.socket.on('user-typing', (data: any) => {
      this.userTypingSubject.next(data);
    });

    // Fehler
    this.socket.on('message-error', (error: any) => {
      console.error('Message error:', error);
    });
  }

  /**
   * Conversations beitreten
   */
  joinConversations(conversationIds: string[]): void {
    if (!this.socket || !this.connected) {
      console.warn('Cannot join conversations - not connected');
      return;
    }

    this.socket.emit('join-conversations', conversationIds);
  }

  /**
   * Nachricht senden
   */
  sendMessage(data: {
    conversationId: string;
    receiverId: string;
    text?: string;
    imageUrl?: string;
    imageName?: string;
  }): void {
    if (!this.socket || !this.connected) {
      console.warn('Cannot send message - not connected');
      return;
    }

    this.socket.emit('send-message', data);
  }

  /**
   * Nachrichten als gelesen markieren
   */
  markAsRead(conversationId: string, messageIds: string[]): void {
    if (!this.socket || !this.connected) {
      console.warn('Cannot mark as read - not connected');
      return;
    }

    this.socket.emit('mark-as-read', {
      conversationId,
      messageIds
    });
  }

  /**
   * Typing-Indikator senden
   */
  sendTyping(conversationId: string, isTyping: boolean): void {
    if (!this.socket || !this.connected) {
      return;
    }

    this.socket.emit('typing', {
      conversationId,
      isTyping
    });
  }

  /**
   * Verbindung trennen
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.connectionStatusSubject.next(false);
    }
  }

  /**
   * Verbindungsstatus prüfen
   */
  isConnected(): boolean {
    return this.connected && this.socket !== null;
  }
}
