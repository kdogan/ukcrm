import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialogSubject = new BehaviorSubject<ConfirmDialogData | null>(null);
  private responseSubject = new Subject<boolean>();

  public dialog$ = this.dialogSubject.asObservable();

  /**
   * Open a confirmation dialog and return a promise that resolves to true (confirm) or false (cancel)
   */
  confirm(data: ConfirmDialogData): Promise<boolean> {
    this.dialogSubject.next({
      ...data,
      confirmText: data.confirmText || 'Bestätigen',
      cancelText: data.cancelText || 'Abbrechen',
      type: data.type || 'warning'
    });

    return new Promise<boolean>((resolve) => {
      const subscription = this.responseSubject.subscribe((result) => {
        subscription.unsubscribe();
        resolve(result);
      });
    });
  }

  /**
   * Shorthand for delete confirmation
   */
  confirmDelete(itemName: string): Promise<boolean> {
    return this.confirm({
      title: 'Löschen bestätigen',
      message: `Möchten Sie "${itemName}" wirklich löschen?`,
      confirmText: 'Löschen',
      cancelText: 'Abbrechen',
      type: 'danger'
    });
  }

  /**
   * Called by the dialog component when user responds
   */
  respond(confirmed: boolean): void {
    this.dialogSubject.next(null);
    this.responseSubject.next(confirmed);
  }

  /**
   * Close dialog without response (treated as cancel)
   */
  close(): void {
    this.respond(false);
  }
}
