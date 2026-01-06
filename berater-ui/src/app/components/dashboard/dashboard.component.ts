import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService, ChartData } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { SubscriptionService, SubscriptionInfo, ExpiringSubscriptionsResponse, ExpiringUser } from '../../services/subscription.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableContainerComponent } from '../shared/tablecontainer.component';
import { ViewportService } from 'src/app/services/viewport.service';
import { DashboardMobileComponent } from './mobile/dashboard-mobile.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    imports: [CommonModule, FormsModule, RouterLink, TableContainerComponent, DashboardMobileComponent, TranslateModule],
    standalone: true
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: any = null;
  userStats: any = null;
  maxContracts = 0;
  maxUsers = 0;
  isSuperAdmin = false;
  currentUser: any = null;
  subscriptionInfo: SubscriptionInfo | null = null;
  expiringSubscriptions: ExpiringUser[] = [];
  expiredSubscriptions: ExpiringUser[] = [];
  expiringDaysThreshold = 30;
  chartData: ChartData | null = null;
  chartMonths = 6;
  maxChartValue = 1;
  showMoreStats = false;
  private subscription: Subscription = new Subscription();

  get isMobile() {
    return this.viewport.isMobile();
  }

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private adminService: AdminService,
    private subscriptionService: SubscriptionService,
    private viewport: ViewportService
  ) {}

  ngOnInit(): void {
    const userSub = this.authService.currentUser$.subscribe(user => {
      if (!user) return; // Ignore null/undefined users

      this.currentUser = user;
      this.isSuperAdmin = user?.role === 'superadmin';

      if (this.isSuperAdmin) {
        this.loadUserStats();
        this.loadStats(); // Load dashboard stats to get upgrade requests
        this.loadExpiringSubscriptions(); // Load expiring subscriptions for Superadmin
      } else {
        this.loadStats();
        this.loadChartData(); // Load chart data for Berater
        this.loadSubscriptionInfo(); // Load subscription info for Berater
      }
    });

    this.subscription.add(userSub);
  }

  loadSubscriptionInfo(): void {
    this.subscriptionService.loadMySubscription().subscribe({
      next: (response) => {
        if (response.success) {
          this.subscriptionInfo = response.data;
        }
      },
      error: (error) => console.error('Error loading subscription info:', error)
    });
  }

  getSubscriptionWarningMessage(): string | null {
    return this.subscriptionService.getWarningMessage();
  }

  getSubscriptionWarningLevel(): 'expired' | 'danger' | 'warning' | 'info' | null {
    return this.subscriptionService.getWarningLevel();
  }

  shouldShowSubscriptionWarning(): boolean {
    return this.subscriptionInfo !== null &&
           this.subscriptionInfo.isExpiringSoon &&
           this.subscriptionInfo.package !== 'free';
  }

  loadExpiringSubscriptions(): void {
    this.subscriptionService.getExpiringSubscriptions(this.expiringDaysThreshold).subscribe({
      next: (response) => {
        if (response.success) {
          this.expiringSubscriptions = response.data.expiring;
          this.expiredSubscriptions = response.data.expired;
        }
      },
      error: (error) => console.error('Error loading expiring subscriptions:', error)
    });
  }

  getWarningLevelBadgeClass(level: string): string {
    const classes: any = {
      'expired': 'badge-expired',
      'danger': 'badge-danger-warning',
      'warning': 'badge-warning',
      'info': 'badge-info'
    };
    return classes[level] || '';
  }

  getWarningLevelLabel(level: string): string {
    const labels: any = {
      'expired': 'Abgelaufen',
      'danger': 'Dringend',
      'warning': 'Warnung',
      'info': 'Info'
    };
    return labels[level] || level;
  }

  getCountByWarningLevel(level: string): number {
    return this.expiringSubscriptions.filter(sub => sub.warningLevel === level).length;
  }

  downgradeExpiredPackages(): void {
    if (!confirm('Möchten Sie wirklich alle abgelaufenen Pakete auf "Free" herabstufen?')) {
      return;
    }

    this.subscriptionService.downgradeExpiredSubscriptions().subscribe({
      next: (response) => {
        if (response.success) {
          alert(`${response.data.length} Paket(e) wurden erfolgreich herabgestuft.`);
          this.loadExpiringSubscriptions(); // Reload list
        }
      },
      error: (error) => {
        console.error('Error downgrading packages:', error);
        alert(error.error?.message || 'Fehler beim Herabstufen der Pakete');
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.stats = response.data;
          this.maxContracts = Math.max(...(this.stats.contractsBySupplier?.map((s: any) => s.count) || [1]));
        }
      },
      error: (error: any) => console.error('Error loading stats:', error)
    });
  }

  loadChartData(): void {
    this.dashboardService.getCharts(this.chartMonths).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.chartData = response.data;
          // Berechne den maximalen Wert für die Balkenhöhe
          const allValues = [
            ...this.chartData!.contracts,
            ...this.chartData!.customers,
            ...this.chartData!.meters
          ];
          this.maxChartValue = Math.max(...allValues, 1);
        }
      },
      error: (error: any) => console.error('Error loading chart data:', error)
    });
  }

  onChartMonthsChange(): void {
    this.loadChartData();
  }

  getBarHeight(value: number): number {
    if (this.maxChartValue === 0) return 0;
    return (value / this.maxChartValue) * 100;
  }

  loadUserStats(): void {
    this.adminService.getUserStats().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.userStats = response.data;
          const roleValues = Object.values(this.userStats.byRole || {}) as number[];
          const packageValues = Object.values(this.userStats.byPackage || {}) as number[];
          this.maxUsers = Math.max(...roleValues, ...packageValues, 1);
        }
      },
      error: (error: any) => console.error('Error loading user stats:', error)
    });
  }

  getRoleStats(): any[] {
    if (!this.userStats?.byRole) return [];
    const roleNames: any = {
      berater: 'Berater',
      admin: 'Admin',
      superadmin: 'Superadmin'
    };
    return Object.entries(this.userStats.byRole).map(([key, value]) => ({
      name: roleNames[key] || key,
      count: value
    }));
  }

  getPackageStats(): any[] {
    if (!this.userStats?.byPackage) return [];
    const packageNames: any = {
      basic: 'Basic',
      professional: 'Professional',
      enterprise: 'Enterprise'
    };
    return Object.entries(this.userStats.byPackage).map(([key, value]) => ({
      name: packageNames[key] || key,
      count: value
    }));
  }

  getDaysRemaining(endDate: string): number {
    const end = new Date(endDate);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getPercentage(count: number): number {
    const max = this.isSuperAdmin ? this.maxUsers : this.maxContracts;
    return (count / max) * 100;
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      pending: 'Neu',
      payment_received: 'Zahlung erhalten',
      approved: 'Genehmigt',
      rejected: 'Abgelehnt',
      cancelled: 'Storniert'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  approveUpgrade(requestId: string): void {
    const adminNotes = prompt('Optional: Notizen zur Genehmigung eingeben');

    if (confirm('Möchten Sie diese Upgrade-Anfrage wirklich genehmigen?\n\nDas Benutzer-Paket wird automatisch aktualisiert.')) {
      this.adminService.approveUpgradeRequest(requestId, adminNotes || undefined).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert(`Upgrade erfolgreich genehmigt!\n\nBenutzer: ${response.data.updatedUser.email}\nNeues Paket: ${response.data.updatedUser.package}`);
            // Dashboard neu laden
            if (this.isSuperAdmin) {
              this.loadUserStats();
              this.loadStats(); // Reload to update upgrade requests
            } else {
              this.loadStats();
            }
          }
        },
        error: (error: any) => {
          console.error('Error approving upgrade:', error);
          alert(error.error?.message || 'Fehler beim Genehmigen der Anfrage');
        }
      });
    }
  }

  rejectUpgrade(requestId: string): void {
    const rejectionReason = prompt('Bitte geben Sie einen Ablehnungsgrund ein:');

    if (!rejectionReason) {
      alert('Ablehnungsgrund ist erforderlich');
      return;
    }

    const adminNotes = prompt('Optional: Zusätzliche Notizen eingeben');

    if (confirm(`Möchten Sie diese Upgrade-Anfrage wirklich ablehnen?\n\nGrund: ${rejectionReason}`)) {
      this.adminService.rejectUpgradeRequest(requestId, rejectionReason, adminNotes || undefined).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert('Upgrade-Anfrage wurde abgelehnt');
            // Dashboard neu laden
            if (this.isSuperAdmin) {
              this.loadUserStats();
              this.loadStats(); // Reload to update upgrade requests
            } else {
              this.loadStats();
            }
          }
        },
        error: (error: any) => {
          console.error('Error rejecting upgrade:', error);
          alert(error.error?.message || 'Fehler beim Ablehnen der Anfrage');
        }
      });
    }
  }
}
