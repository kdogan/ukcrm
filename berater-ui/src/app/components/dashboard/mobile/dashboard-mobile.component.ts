import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SubscriptionInfo } from '../../../services/subscription.service';
import { ChartData } from '../../../services/dashboard.service';
import { StatCard } from '../dashboard.component';

@Component({
  selector: 'app-dashboard-mobile',
  imports: [CommonModule, FormsModule, RouterLink],
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
  @Input() subscriptionInfo: SubscriptionInfo | null = null;
  @Input() subscriptionWarningMessage: string | null = null;
  @Input() subscriptionWarningLevel: 'expired' | 'danger' | 'warning' | 'info' | null = null;
  @Input() chartData: ChartData | null = null;
  @Input() maxChartValue: number = 1;
  @Input() favoriteStats: string[] = [];
  @Input() availableStatCards: StatCard[] = [];

  @Output() approveUpgradeEvent = new EventEmitter<string>();
  @Output() rejectUpgradeEvent = new EventEmitter<string>();
  @Output() chartMonthsChange = new EventEmitter<number>();
  @Output() toggleFavoriteEvent = new EventEmitter<string>();

  chartMonths = 6;
  showAllStats = false;

  shouldShowSubscriptionWarning(): boolean {
    return this.subscriptionInfo !== null &&
           this.subscriptionInfo.isExpiringSoon &&
           this.subscriptionInfo.package !== 'free';
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

  onChartMonthsChange(): void {
    this.chartMonthsChange.emit(this.chartMonths);
  }

  getBarHeight(value: number): number {
    if (this.maxChartValue === 0) return 0;
    return (value / this.maxChartValue) * 100;
  }

  isFavorite(statId: string): boolean {
    return this.favoriteStats.includes(statId);
  }

  toggleFavorite(statId: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.toggleFavoriteEvent.emit(statId);
  }

  getFavoriteStatCards(): StatCard[] {
    return this.availableStatCards.filter(card => this.favoriteStats.includes(card.id));
  }
}
