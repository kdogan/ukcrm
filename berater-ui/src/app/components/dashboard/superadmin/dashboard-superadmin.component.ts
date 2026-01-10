import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableContainerComponent } from '../../shared/tablecontainer.component';
import { AdminService } from '../../../services/admin.service';
import { SubscriptionService, ExpiringUser } from '../../../services/subscription.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-superadmin',
  templateUrl: './dashboard-superadmin.component.html',
  styleUrls: ['./dashboard-superadmin.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, TableContainerComponent]
})
export class DashboardSuperadminComponent implements OnInit, OnDestroy {
  @Input() stats: any = null;
  @Output() approveUpgradeEvent = new EventEmitter<string>();
  @Output() rejectUpgradeEvent = new EventEmitter<string>();
  @Output() reloadStats = new EventEmitter<void>();

  userStats: any = null;
  maxUsers = 0;
  expiringSubscriptions: ExpiringUser[] = [];
  expiredSubscriptions: ExpiringUser[] = [];
  expiringDaysThreshold = 30;

  private subscription: Subscription = new Subscription();

  constructor(
    private adminService: AdminService,
    private subscriptionService: SubscriptionService,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadUserStats();
    this.loadExpiringSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

  getPercentage(count: number): number {
    return (count / this.maxUsers) * 100;
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

  async downgradeExpiredPackages(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Pakete herabstufen',
      message: 'Möchten Sie wirklich alle abgelaufenen Pakete auf "Free" herabstufen?',
      confirmText: 'Herabstufen',
      cancelText: 'Abbrechen',
      type: 'warning'
    });

    if (!confirmed) return;

    this.subscriptionService.downgradeExpiredSubscriptions().subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(`${response.data.length} Paket(e) wurden erfolgreich herabgestuft.`);
          this.loadExpiringSubscriptions();
        }
      },
      error: (error) => {
        console.error('Error downgrading packages:', error);
        this.toastService.error(error.error?.message || 'Fehler beim Herabstufen der Pakete');
      }
    });
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

  async approveUpgrade(requestId: string): Promise<void> {
    const adminNotes = prompt('Optional: Notizen zur Genehmigung eingeben');

    const confirmed = await this.confirmDialog.confirm({
      title: 'Upgrade genehmigen',
      message: 'Möchten Sie diese Upgrade-Anfrage wirklich genehmigen?\n\nDas Benutzer-Paket wird automatisch aktualisiert.',
      confirmText: 'Genehmigen',
      cancelText: 'Abbrechen',
      type: 'info'
    });

    if (!confirmed) return;

    this.adminService.approveUpgradeRequest(requestId, adminNotes || undefined).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toastService.success(`Upgrade erfolgreich genehmigt! Benutzer: ${response.data.updatedUser.email}, Neues Paket: ${response.data.updatedUser.package}`);
          this.loadUserStats();
          this.reloadStats.emit();
        }
      },
      error: (error: any) => {
        console.error('Error approving upgrade:', error);
        this.toastService.error(error.error?.message || 'Fehler beim Genehmigen der Anfrage');
      }
    });
  }

  async rejectUpgrade(requestId: string): Promise<void> {
    const rejectionReason = prompt('Bitte geben Sie einen Ablehnungsgrund ein:');

    if (!rejectionReason) {
      this.toastService.warning('Ablehnungsgrund ist erforderlich');
      return;
    }

    const adminNotes = prompt('Optional: Zusätzliche Notizen eingeben');

    const confirmed = await this.confirmDialog.confirm({
      title: 'Upgrade ablehnen',
      message: `Möchten Sie diese Upgrade-Anfrage wirklich ablehnen?\n\nGrund: ${rejectionReason}`,
      confirmText: 'Ablehnen',
      cancelText: 'Abbrechen',
      type: 'danger'
    });

    if (!confirmed) return;

    this.adminService.rejectUpgradeRequest(requestId, rejectionReason, adminNotes || undefined).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toastService.success('Upgrade-Anfrage wurde abgelehnt');
          this.loadUserStats();
          this.reloadStats.emit();
        }
      },
      error: (error: any) => {
        console.error('Error rejecting upgrade:', error);
        this.toastService.error(error.error?.message || 'Fehler beim Ablehnen der Anfrage');
      }
    });
  }
}
