import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MessagesService } from './messages.service';

@Injectable({
  providedIn: 'root'
})
export class UnreadMessagesService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$: Observable<number> = this.unreadCountSubject.asObservable();

  constructor(private messagesService: MessagesService) {}

  /**
   * Anzahl ungelesener Nachrichten aktualisieren
   */
  updateUnreadCount(): void {
    this.messagesService.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadCountSubject.next(response.count || 0);
      },
      error: (err) => {
        console.error('Error fetching unread count:', err);
      }
    });
  }

  /**
   * Unread Count manuell setzen
   */
  setUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  /**
   * Unread Count inkrementieren
   */
  incrementUnreadCount(): void {
    const currentCount = this.unreadCountSubject.value;
    this.unreadCountSubject.next(currentCount + 1);
  }

  /**
   * Unread Count dekrementieren
   */
  decrementUnreadCount(amount: number = 1): void {
    const currentCount = this.unreadCountSubject.value;
    const newCount = Math.max(0, currentCount - amount);
    this.unreadCountSubject.next(newCount);
  }

  /**
   * Aktuellen Unread Count abrufen
   */
  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }
}
