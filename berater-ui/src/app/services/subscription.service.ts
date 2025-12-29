import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SubscriptionInfo {
  package: string;
  subscription: {
    billingInterval: 'monthly' | 'yearly';
    startDate?: Date;
    endDate?: Date;
    lastPaymentDate?: Date;
    nextPaymentDate?: Date;
    autoRenew: boolean;
    status: 'active' | 'cancelled' | 'expired' | 'pending';
  };
  packageLimits: {
    maxCustomers: number;
    maxContracts: number;
    maxMeters: number;
  };
  daysUntilExpiration: number | null;
  isExpiringSoon: boolean;
  expirationWarningLevel: 'expired' | 'danger' | 'warning' | 'info' | null;
}

export interface ExpiringUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  package: string;
  subscription: any;
  daysUntilExpiration?: number;
  daysExpired?: number;
  warningLevel: 'expired' | 'danger' | 'warning' | 'info';
  lastLogin?: Date;
}

export interface ExpiringSubscriptionsResponse {
  success: boolean;
  data: {
    expiring: ExpiringUser[];
    expired: ExpiringUser[];
    summary: {
      totalExpiring: number;
      totalExpired: number;
      dangerZone: number;
      warningZone: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/subscription`;
  private subscriptionInfo$ = new BehaviorSubject<SubscriptionInfo | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Gibt die aktuelle Subscription-Info als Observable zurück
   */
  getSubscriptionInfo$(): Observable<SubscriptionInfo | null> {
    return this.subscriptionInfo$.asObservable();
  }

  /**
   * Lädt die Subscription-Informationen des aktuellen Benutzers
   */
  loadMySubscription(): Observable<{ success: boolean; data: SubscriptionInfo }> {
    return this.http.get<{ success: boolean; data: SubscriptionInfo }>(`${this.apiUrl}/my-subscription`).pipe(
      tap(response => {
        if (response.success) {
          this.subscriptionInfo$.next(response.data);
        }
      })
    );
  }

  /**
   * Gibt die aktuellen Subscription-Informationen zurück (ohne API-Call)
   */
  getCurrentSubscriptionInfo(): SubscriptionInfo | null {
    return this.subscriptionInfo$.value;
  }

  /**
   * Gibt alle Benutzer mit ablaufenden Paketen zurück (nur Superadmin)
   */
  getExpiringSubscriptions(daysThreshold: number = 30): Observable<ExpiringSubscriptionsResponse> {
    return this.http.get<ExpiringSubscriptionsResponse>(`${this.apiUrl}/expiring?daysThreshold=${daysThreshold}`);
  }

  /**
   * Setzt alle abgelaufenen Pakete auf "free" zurück (nur Superadmin)
   */
  downgradeExpiredSubscriptions(): Observable<{ success: boolean; message: string; data: any[] }> {
    return this.http.post<{ success: boolean; message: string; data: any[] }>(`${this.apiUrl}/downgrade-expired`, {});
  }

  /**
   * Prüft ob die Subscription bald abläuft
   */
  isExpiringSoon(): boolean {
    const info = this.subscriptionInfo$.value;
    return info ? info.isExpiringSoon : false;
  }

  /**
   * Gibt die Warnstufe zurück
   */
  getWarningLevel(): 'expired' | 'danger' | 'warning' | 'info' | null {
    const info = this.subscriptionInfo$.value;
    return info ? info.expirationWarningLevel : null;
  }

  /**
   * Gibt die Tage bis zum Ablauf zurück
   */
  getDaysUntilExpiration(): number | null {
    const info = this.subscriptionInfo$.value;
    return info ? info.daysUntilExpiration : null;
  }

  /**
   * Gibt die Warnung-Nachricht zurück
   */
  getWarningMessage(): string | null {
    const info = this.subscriptionInfo$.value;
    if (!info || !info.isExpiringSoon || info.package === 'free') {
      return null;
    }

    const days = info.daysUntilExpiration;

    if (info.expirationWarningLevel === 'expired') {
      return `Ihr Paket ist abgelaufen! Sie wurden automatisch auf das kostenlose Paket herabgestuft. Bitte verlängern Sie Ihr Paket, um alle Funktionen wieder nutzen zu können.`;
    } else if (info.expirationWarningLevel === 'danger') {
      return `Ihr Paket läuft in ${days} Tag${days === 1 ? '' : 'en'} ab! Bitte verlängern Sie Ihr Paket, um eine Herabstufung auf das kostenlose Paket zu vermeiden.`;
    } else if (info.expirationWarningLevel === 'warning') {
      return `Ihr Paket läuft in ${days} Tagen ab. Denken Sie daran, Ihr Paket zu verlängern.`;
    } else if (info.expirationWarningLevel === 'info') {
      return `Ihr Paket läuft in ${days} Tagen ab.`;
    }

    return null;
  }

  /**
   * Invalidiert die Subscription-Info (z.B. nach Package-Wechsel)
   */
  invalidateSubscriptionInfo(): void {
    this.subscriptionInfo$.next(null);
  }
}
