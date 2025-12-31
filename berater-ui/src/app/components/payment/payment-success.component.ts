import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PaypalService } from '../../services/paypal.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-container">
      <div class="payment-card" *ngIf="!loading && !error">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h1>Zahlung erfolgreich!</h1>
        <p class="message">Ihre Zahlung wurde erfolgreich verarbeitet.</p>

        <div class="details" *ngIf="subscriptionDetails">
          <h3>Subscription-Details:</h3>
          <div class="detail-item">
            <span class="label">Paket:</span>
            <span class="value">{{ subscriptionDetails.package }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Zahlungsintervall:</span>
            <span class="value">{{ subscriptionDetails.billingIntervalText }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Preis:</span>
            <span class="value">{{ subscriptionDetails.price }} EUR</span>
          </div>
          <div class="detail-item" *ngIf="subscriptionDetails.savings > 0">
            <span class="label">Ersparnis:</span>
            <span class="value success">{{ subscriptionDetails.savings }} EUR</span>
          </div>
          <div class="detail-item">
            <span class="label">Transaktions-ID:</span>
            <span class="value small">{{ subscriptionDetails.transactionId }}</span>
          </div>
        </div>

        <button class="btn-primary" (click)="navigateToDashboard()">
          Zum Dashboard
        </button>
      </div>

      <div class="payment-card" *ngIf="loading">
        <div class="loading-icon">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <h1>Zahlung wird verarbeitet...</h1>
        <p class="message">Bitte warten Sie einen Moment.</p>
      </div>

      <div class="payment-card error" *ngIf="error">
        <div class="error-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <h1>Fehler bei der Zahlung</h1>
        <p class="message">{{ errorMessage }}</p>
        <button class="btn-secondary" (click)="navigateToPackages()">
          Zurück zu Paketen
        </button>
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

      &.error {
        border-top: 4px solid #dc3545;
      }
    }

    .success-icon {
      font-size: 5rem;
      color: #28a745;
      margin-bottom: 1.5rem;
      animation: scaleIn 0.5s ease-out;
    }

    .loading-icon {
      font-size: 4rem;
      color: #667eea;
      margin-bottom: 1.5rem;
    }

    .error-icon {
      font-size: 5rem;
      color: #dc3545;
      margin-bottom: 1.5rem;
      animation: shake 0.5s ease-out;
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
    }

    .details {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      margin: 2rem 0;
      text-align: left;

      h3 {
        margin: 0 0 1rem 0;
        font-size: 1.2rem;
        color: #333;
      }
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e0e0e0;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 600;
        color: #666;
      }

      .value {
        color: #333;

        &.success {
          color: #28a745;
          font-weight: 600;
        }

        &.small {
          font-size: 0.85rem;
          word-break: break-all;
        }
      }
    }

    .btn-primary, .btn-secondary {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 1rem;
    }

    .btn-primary {
      background: #28a745;
      color: white;

      &:hover {
        background: #218838;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
      }
    }

    .btn-secondary {
      background: #6c757d;
      color: white;

      &:hover {
        background: #5a6268;
      }
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
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

      .success-icon, .error-icon {
        font-size: 3.5rem;
      }
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  loading = true;
  error = false;
  errorMessage = '';
  subscriptionDetails: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private paypalService: PaypalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get token from URL query params (PayPal returns token parameter)
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const orderId = sessionStorage.getItem('paypalOrderId');

      if (orderId) {
        this.capturePayment(orderId);
      } else if (token) {
        // Fallback if orderId not in session
        this.capturePayment(token);
      } else {
        this.error = true;
        this.loading = false;
        this.errorMessage = 'Keine Bestellinformationen gefunden.';
      }
    });
  }

  capturePayment(orderId: string): void {
    this.paypalService.captureOrder(orderId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.subscriptionDetails = response.subscription;
          // Aktualisiere User-Daten im AuthService (inkl. packageFeatures)
          if (response.data) {
            this.authService.updateCurrentUser(response.data);
          }
          // Clear session storage
          sessionStorage.removeItem('paypalOrderId');
          sessionStorage.removeItem('paypalPackageName');
          sessionStorage.removeItem('paypalBillingInterval');
        } else {
          this.error = true;
          this.errorMessage = response.message || 'Fehler beim Verarbeiten der Zahlung';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = error.error?.message || 'Ein Fehler ist aufgetreten. Bitte kontaktieren Sie den Support.';
        console.error('Payment capture error:', error);
      }
    });
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToPackages(): void {
    this.router.navigate(['/packages']);
  }
}
