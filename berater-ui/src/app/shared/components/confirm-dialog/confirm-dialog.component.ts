import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmDialogService, ConfirmDialogData } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dialogData) {
      <div class="dialog-overlay" (click)="onCancel()">
        <div class="dialog-container" [class]="'dialog-' + dialogData.type" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <div class="dialog-icon">
              @switch (dialogData.type) {
                @case ('danger') {
                  <i class="fas fa-exclamation-triangle"></i>
                }
                @case ('warning') {
                  <i class="fas fa-question-circle"></i>
                }
                @case ('info') {
                  <i class="fas fa-info-circle"></i>
                }
              }
            </div>
            <h3 class="dialog-title">{{ dialogData.title }}</h3>
          </div>
          <div class="dialog-body">
            <p class="dialog-message">{{ dialogData.message }}</p>
          </div>
          <div class="dialog-footer">
            <button class="btn btn-cancel" (click)="onCancel()">
              {{ dialogData.cancelText }}
            </button>
            <button class="btn btn-confirm" [class]="'btn-' + dialogData.type" (click)="onConfirm()">
              {{ dialogData.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .dialog-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      max-width: 420px;
      width: 90%;
      animation: slideUp 0.3s ease-out;
      overflow: hidden;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem 1.5rem 1rem;
    }

    .dialog-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .dialog-danger .dialog-icon {
      background: #fee2e2;
      color: #dc2626;
    }

    .dialog-warning .dialog-icon {
      background: #fef3c7;
      color: #d97706;
    }

    .dialog-info .dialog-icon {
      background: #dbeafe;
      color: #2563eb;
    }

    .dialog-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .dialog-body {
      padding: 0 1.5rem 1.5rem;
    }

    .dialog-message {
      margin: 0;
      color: #4b5563;
      font-size: 0.95rem;
      line-height: 1.6;
      white-space: pre-line;
    }

    .dialog-footer {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-cancel {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
    }

    .btn-confirm {
      color: white;
    }

    .btn-danger {
      background: #dc2626;
    }

    .btn-danger:hover {
      background: #b91c1c;
    }

    .btn-warning {
      background: #d97706;
    }

    .btn-warning:hover {
      background: #b45309;
    }

    .btn-info {
      background: #2563eb;
    }

    .btn-info:hover {
      background: #1d4ed8;
    }

    @media (max-width: 480px) {
      .dialog-container {
        width: 95%;
        margin: 1rem;
      }

      .dialog-footer {
        flex-direction: column-reverse;
      }

      .btn {
        width: 100%;
        padding: 0.75rem;
      }
    }
  `]
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  dialogData: ConfirmDialogData | null = null;
  private subscription?: Subscription;

  constructor(private confirmDialogService: ConfirmDialogService) {}

  ngOnInit(): void {
    this.subscription = this.confirmDialogService.dialog$.subscribe(data => {
      this.dialogData = data;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onConfirm(): void {
    this.confirmDialogService.respond(true);
  }

  onCancel(): void {
    this.confirmDialogService.respond(false);
  }
}
