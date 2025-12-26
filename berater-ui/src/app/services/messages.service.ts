import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly baseUrl = '/api/messages';

  constructor(private http: HttpClient) {}

  getMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${environment.apiUrl}/messages/${conversationId}`);
  }

  sendMessage(conversationId: string, receiverId: string, text: string, image?: File): Observable<Message> {
    const formData = new FormData();
    formData.append('conversationId', conversationId);
    formData.append('receiverId', receiverId);
    formData.append('text', text);
    if (image) {
      formData.append('image', image);
    }
    return this.http.post<Message>(`${environment.apiUrl}/messages`, formData);
  }

  markAsRead(conversationId: string): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/messages/read/${conversationId}`, {});
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${environment.apiUrl}/messages/unread/count`);
  }

  getConversations(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/messages/conversations`);
  }
  createConversation(receiverId: string): Observable<any> {
  return this.http.post<any>(`${environment.apiUrl}/messages/conversations`, { receiverId });
}

  loadUsers(): Observable<{ _id: string; name: string; address?: string }[]> {
    return this.http.get<{ _id: string; name: string; address?: string }[]>(`${environment.apiUrl}/users`);
  }
}
