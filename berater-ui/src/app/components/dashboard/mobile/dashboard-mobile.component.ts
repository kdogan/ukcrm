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
  @Input() isSuperAdmin: boolean = false;
  @Input() maxContracts: number = 0;
  @Input() subscriptionInfo: SubscriptionInfo | null = null;
  @Input() subscriptionWarningMessage: string | null = null;
  @Input() subscriptionWarningLevel: 'expired' | 'danger' | 'warning' | 'info' | null = null;
  @Input() chartData: ChartData | null = null;
  @Input() maxChartValue: number = 1;
  @Input() favoriteStats: string[] = [];
  @Input() availableStatCards: StatCard[] = [];

  @Output() chartMonthsChange = new EventEmitter<number>();
  @Output() toggleFavoriteEvent = new EventEmitter<string>();

  chartMonths = 6;
  showAllStats = false;

  shouldShowSubscriptionWarning(): boolean {
    return this.subscriptionInfo !== null &&
           this.subscriptionInfo.isExpiringSoon &&
           this.subscriptionInfo.package !== 'free';
  }

  getDaysOverdue(endDate: string): number {
    const end = new Date(endDate);
    const today = new Date();
    const diff = today.getTime() - end.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getDaysRemaining(endDate: string): number {
    const end = new Date(endDate);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getPercentage(count: number): number {
    return (count / this.maxContracts) * 100;
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

  // Kreisdiagramm-Methoden für Anbieter-Statistik
  supplierColors: string[] = [
    '#667eea', '#764ba2', '#11998e', '#38ef7d', '#f093fb',
    '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a',
    '#fee140', '#fa709a', '#6a11cb', '#2575fc'
  ];

  getTotalSupplierContracts(): number {
    if (!this.stats?.contractsBySupplier) return 0;
    return this.stats.contractsBySupplier.reduce((sum: number, item: { count: number }) => sum + item.count, 0);
  }

  getSupplierPercentage(count: number): number {
    const total = this.getTotalSupplierContracts();
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }

  getSupplierColor(index: number): string {
    return this.supplierColors[index % this.supplierColors.length];
  }

  getPieChartGradient(): string {
    if (!this.stats?.contractsBySupplier || this.stats.contractsBySupplier.length === 0) {
      return 'conic-gradient(#e5e7eb 0deg 360deg)';
    }

    const total = this.getTotalSupplierContracts();
    if (total === 0) return 'conic-gradient(#e5e7eb 0deg 360deg)';

    let currentAngle = 0;
    const segments: string[] = [];

    this.stats.contractsBySupplier.forEach((item: { count: number }, index: number) => {
      const percentage = (item.count / total) * 100;
      const angle = (percentage / 100) * 360;
      const color = this.getSupplierColor(index);
      segments.push(`${color} ${currentAngle}deg ${currentAngle + angle}deg`);
      currentAngle += angle;
    });

    return `conic-gradient(${segments.join(', ')})`;
  }
}
