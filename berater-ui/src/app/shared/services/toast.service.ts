import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private idCounter = 0;

  /**
   * Show a success toast message
   */
  success(message: string, duration: number = 4000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Show an error toast message
   */
  error(message: string, duration: number = 6000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Show a warning toast message
   */
  warning(message: string, duration: number = 5000): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Show an info toast message
   */
  info(message: string, duration: number = 4000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Show a toast message
   */
  private show(message: string, type: Toast['type'], duration: number): void {
    const toast: Toast = {
      id: ++this.idCounter,
      message,
      type,
      duration
    };

    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
  }

  /**
   * Remove a toast by ID
   */
  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toasts = [];
    this.toastsSubject.next([]);
  }
}
