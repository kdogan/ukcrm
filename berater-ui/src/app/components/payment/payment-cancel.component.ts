import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-container">
      <div class="payment-card">
        <div class="cancel-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <h1>Zahlung abgebrochen</h1>
        <p class="message">
          Sie haben die Zahlung abgebrochen. Keine Sorge, es wurden keine Gebühren berechnet.
        </p>

        <div class="info-box">
          <i class="fas fa-info-circle"></i>
          <p>Wenn Sie Fragen haben oder Hilfe benötigen, kontaktieren Sie bitte unseren Support.</p>
        </div>

        <div class="actions">
          <button class="btn-primary" (click)="navigateToPackages()">
            Zurück zu Paketen
          </button>
          <button class="btn-secondary" (click)="navigateToDashboard()">
            Zum Dashboard
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .payment-card {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      max-width: 600px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      border-top: 4px solid #ffc107;
    }

    .cancel-icon {
      font-size: 5rem;
      color: #ffc107;
      margin-bottom: 1.5rem;
      animation: fadeIn 0.5s ease-out;
    }

    h1 {
      font-size: 2rem;
      color: #333;
      margin-bottom: 1rem;
    }

    .message {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .info-box {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 2rem 0;
      display: flex;
      align-items: center;
      gap: 1rem;

      i {
        font-size: 2rem;
        color: #ffc107;
        flex-shrink: 0;
      }

      p {
        margin: 0;
        color: #856404;
        text-align: left;
        line-height: 1.5;
      }
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    .btn-primary, .btn-secondary {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #667eea;
      color: white;

      &:hover {
        background: #5568d3;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }
    }

    .btn-secondary {
      background: #6c757d;
      color: white;

      &:hover {
        background: #5a6268;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @media (max-width: 768px) {
      .payment-container {
        padding: 1rem;
      }

      .payment-card {
        padding: 2rem 1.5rem;
      }

      h1 {
        font-size: 1.5rem;
      }

      .cancel-icon {
        font-size: 3.5rem;
      }

      .actions {
        flex-direction: column;
      }

      .btn-primary, .btn-secondary {
        width: 100%;
      }
    }
  `]
})
export class PaymentCancelComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Clear session storage
    sessionStorage.removeItem('paypalOrderId');
    sessionStorage.removeItem('paypalPackageName');
    sessionStorage.removeItem('paypalBillingInterval');
  }

  navigateToPackages(): void {
    this.router.navigate(['/packages']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
