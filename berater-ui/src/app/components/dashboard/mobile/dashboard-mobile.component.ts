import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-mobile',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-mobile.component.html',
  styleUrl: './dashboard-mobile.component.scss',
  standalone: true
})
export class DashboardMobileComponent {
  @Input() stats: any;
  @Input() userStats: any;
  @Input() isSuperAdmin: boolean = false;
  @Input() maxContracts: number = 0;
  @Input() maxUsers: number = 0;

  @Output() approveUpgradeEvent = new EventEmitter<string>();
  @Output() rejectUpgradeEvent = new EventEmitter<string>();

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
}
