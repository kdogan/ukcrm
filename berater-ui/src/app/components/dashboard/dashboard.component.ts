import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService, ChartData } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionService, SubscriptionInfo } from '../../services/subscription.service';
import { StatisticsService, ContractStatisticsData, StatisticsSupplier, EndingForecastData } from '../../services/statistics.service';
import { SettingsService } from '../../services/settings.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TableContainerComponent } from '../shared/tablecontainer.component';
import { ViewportService } from 'src/app/services/viewport.service';
import { DashboardMobileComponent } from './mobile/dashboard-mobile.component';
import { DashboardSuperadminComponent } from './superadmin/dashboard-superadmin.component';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../shared/services/toast.service';

// Definition der verfügbaren Statistik-Karten
export interface StatCard {
  id: string;
  icon: string;
  titleKey: string;
  tooltipKey: string;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    imports: [CommonModule, FormsModule, RouterLink, TableContainerComponent, DashboardMobileComponent, DashboardSuperadminComponent, TranslateModule],
    standalone: true
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: any = null;
  maxContracts = 0;
  isSuperAdmin = false;
  currentUser: any = null;
  subscriptionInfo: SubscriptionInfo | null = null;
  chartData: ChartData | null = null;
  chartMonths = 6;
  maxChartValue = 1;
  showMoreStats = false;

  // Contract Statistics
  contractStats: ContractStatisticsData | null = null;
  contractStatsMonths = 6;
  contractStatsMonthOptions = [1, 3, 6, 9, 12];
  showCustomMonthsInput = false;
  customMonths: number | null = null;
  maxContractBarHeight = 1;
  contractStatsLoading = false;
  selectedSupplierId = 'all';

  // Supplier Autocomplete (for Contract Statistics)
  supplierSearchQuery = '';
  showSupplierDropdown = false;
  filteredSuppliers: StatisticsSupplier[] = [];

  // Ending Forecast (separate from Contract Statistics)
  forecastData: EndingForecastData | null = null;
  forecastMonths = 6;
  forecastMonthOptions = [3, 6, 9, 12];
  forecastLoading = false;
  forecastSupplierId = 'all';
  forecastSupplierSearchQuery = '';
  showForecastSupplierDropdown = false;
  filteredForecastSuppliers: StatisticsSupplier[] = [];

  // Tooltip
  activeTooltip: string | null = null;

  // Modal für überfällige Verträge
  showOverdueModal = false;

  // Favorit-Statistiken
  favoriteStats: string[] = [];
  availableStatCards: StatCard[] = [
    { id: 'reminders', icon: 'fa-bell', titleKey: 'SETTINGS.REMINDERS.TITLE', tooltipKey: 'DASHBOARD.TOOLTIPS.REMINDERS' },
    { id: 'contracts', icon: 'fa-file-contract', titleKey: 'DASHBOARD.CONTRACTS', tooltipKey: 'DASHBOARD.TOOLTIPS.CONTRACTS' },
    { id: 'recentReadings', icon: 'fa-tachometer-alt', titleKey: 'DASHBOARD.RECENT_CONTRACTS_READINGS', tooltipKey: 'DASHBOARD.TOOLTIPS.RECENT_CONTRACTS_READINGS' },
    { id: 'customers', icon: 'fa-users', titleKey: 'DASHBOARD.CUSTOMERS', tooltipKey: 'DASHBOARD.TOOLTIPS.CUSTOMERS' },
    { id: 'meters', icon: 'fa-bolt', titleKey: 'DASHBOARD.METERS', tooltipKey: 'DASHBOARD.TOOLTIPS.METERS' },
    { id: 'newCustomers', icon: 'fa-user-plus', titleKey: 'DASHBOARD.NEW_CUSTOMERS', tooltipKey: 'DASHBOARD.TOOLTIPS.NEW_CUSTOMERS' },
    { id: 'overdueContracts', icon: 'fa-exclamation-triangle', titleKey: 'DASHBOARD.OVERDUE_CONTRACTS', tooltipKey: 'DASHBOARD.TOOLTIPS.OVERDUE_CONTRACTS' },
    { id: 'contractsBySupplier', icon: 'fa-chart-pie', titleKey: 'DASHBOARD.CONTRACTS_BY_SUPPLIER', tooltipKey: 'DASHBOARD.TOOLTIPS.CONTRACTS_BY_SUPPLIER' },
    { id: 'monthlyTrends', icon: 'fa-chart-line', titleKey: 'DASHBOARD.MONTHLY_TRENDS', tooltipKey: 'DASHBOARD.TOOLTIPS.MONTHLY_TRENDS' },
    { id: 'contractStatistics', icon: 'fa-chart-bar', titleKey: 'STATISTICS.TITLE', tooltipKey: 'DASHBOARD.TOOLTIPS.CONTRACT_STATISTICS' },
    { id: 'endingForecast', icon: 'fa-calendar-check', titleKey: 'STATISTICS.ENDING_FORECAST', tooltipKey: 'DASHBOARD.TOOLTIPS.ENDING_FORECAST' }
  ];

  // Farben passend zu den globalen CSS-Variablen (styles.scss) und contracts-mobile.component.scss
  statusColors: { [key: string]: string } = {
    draft: '#1976d2',     // Blau - Entwurf (--info-color)
    active: '#2e7d32',    // Grün - Belieferung (--success-color)
    ended: '#f9a825',     // Gelb/Orange - Beendet
    archived: '#c62828'   // Rot - Gekündigt (--danger-color)
  };

  private subscription: Subscription = new Subscription();

  get isMobile() {
    return this.viewport.isMobile();
  }

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private statisticsService: StatisticsService,
    private settingsService: SettingsService,
    private viewport: ViewportService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Lade Favoriten-Einstellungen
    this.loadFavoriteStats();

    const userSub = this.authService.currentUser$.subscribe(user => {
      if (!user) return; // Ignore null/undefined users

      this.currentUser = user;
      this.isSuperAdmin = user?.role === 'superadmin';

      if (!this.isSuperAdmin) {
        // Berater Dashboard laden
        this.loadStats();
        this.loadChartData();
        this.loadSubscriptionInfo();
        this.loadContractStatistics();
        this.loadEndingForecast();
      }
      // Superadmin Dashboard wird jetzt von der separaten Komponente geladen
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

  // Contract Statistics Methods
  loadContractStatistics(): void {
    this.contractStatsLoading = true;
    const months = this.showCustomMonthsInput && this.customMonths ? this.customMonths : this.contractStatsMonths;

    this.statisticsService.getContractStatistics(months, this.selectedSupplierId).subscribe({
      next: (response) => {
        if (response.success) {
          this.contractStats = response.data;
          this.calculateMaxContractBarHeight();
        }
        this.contractStatsLoading = false;
      },
      error: (error) => {
        console.error('Error loading contract statistics:', error);
        this.contractStatsLoading = false;
      }
    });
  }

  onSupplierChange(): void {
    this.loadContractStatistics();
  }

  // Supplier Autocomplete Methods
  onSupplierSearchFocus(): void {
    this.showSupplierDropdown = true;
    this.filterSupplierList();
  }

  onSupplierSearchInput(): void {
    this.showSupplierDropdown = true;
    this.filterSupplierList();
  }

  filterSupplierList(): void {
    if (!this.contractStats?.suppliers) {
      this.filteredSuppliers = [];
      return;
    }
    const query = this.supplierSearchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredSuppliers = this.contractStats.suppliers.slice(0, 20);
    } else {
      this.filteredSuppliers = this.contractStats.suppliers.filter(supplier =>
        supplier.name?.toLowerCase().includes(query) ||
        supplier.shortName?.toLowerCase().includes(query)
      ).slice(0, 20);
    }
  }

  selectSupplierFilter(supplier: StatisticsSupplier | null): void {
    if (supplier) {
      this.selectedSupplierId = supplier._id;
      this.supplierSearchQuery = '';
    } else {
      this.selectedSupplierId = 'all';
      this.supplierSearchQuery = '';
    }
    this.showSupplierDropdown = false;
    this.loadContractStatistics();
  }

  clearSupplierSelection(): void {
    this.selectedSupplierId = 'all';
    this.supplierSearchQuery = '';
    this.loadContractStatistics();
  }

  closeSupplierDropdownDelayed(): void {
    setTimeout(() => {
      this.showSupplierDropdown = false;
    }, 200);
  }

  getSelectedSupplierName(): string | null {
    if (this.selectedSupplierId === 'all' || !this.contractStats?.suppliers) {
      return null;
    }
    const supplier = this.contractStats.suppliers.find(s => s._id === this.selectedSupplierId);
    return supplier ? (supplier.shortName || supplier.name) : null;
  }

  // Tooltip Methods
  toggleTooltip(tooltipId: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.activeTooltip === tooltipId) {
      this.activeTooltip = null;
    } else {
      this.activeTooltip = tooltipId;
    }
  }

  closeTooltip(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.activeTooltip = null;
  }

  calculateMaxContractBarHeight(): void {
    if (!this.contractStats) return;
    let max = 1;
    this.contractStats.chartData.datasets.forEach(dataset => {
      dataset.data.forEach(value => {
        if (value > max) max = value;
      });
    });
    this.maxContractBarHeight = max;
  }

  getContractBarHeight(value: number): number {
    if (this.maxContractBarHeight === 0) return 0;
    return (value / this.maxContractBarHeight) * 100;
  }

  onContractStatsMonthsChange(months: number): void {
    this.contractStatsMonths = months;
    this.showCustomMonthsInput = false;
    this.loadContractStatistics();
  }

  onCustomMonthsChange(): void {
    if (this.customMonths && this.customMonths > 0 && this.customMonths <= 24) {
      this.loadContractStatistics();
    }
  }

  // Ending Forecast Methods (separate from Contract Statistics)
  loadEndingForecast(): void {
    this.forecastLoading = true;
    this.statisticsService.getEndingForecast(this.forecastMonths, this.forecastSupplierId).subscribe({
      next: (response) => {
        if (response.success) {
          this.forecastData = response.data;
        }
        this.forecastLoading = false;
      },
      error: (error) => {
        console.error('Error loading ending forecast:', error);
        this.forecastLoading = false;
      }
    });
  }

  onForecastMonthsChange(months: number): void {
    this.forecastMonths = months;
    this.loadEndingForecast();
  }

  // Forecast Supplier Autocomplete Methods
  onForecastSupplierSearchFocus(): void {
    this.showForecastSupplierDropdown = true;
    this.filterForecastSupplierList();
  }

  onForecastSupplierSearchInput(): void {
    this.showForecastSupplierDropdown = true;
    this.filterForecastSupplierList();
  }

  filterForecastSupplierList(): void {
    if (!this.forecastData?.suppliers) {
      this.filteredForecastSuppliers = [];
      return;
    }
    const query = this.forecastSupplierSearchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredForecastSuppliers = this.forecastData.suppliers.slice(0, 20);
    } else {
      this.filteredForecastSuppliers = this.forecastData.suppliers.filter(supplier =>
        supplier.name?.toLowerCase().includes(query) ||
        supplier.shortName?.toLowerCase().includes(query)
      ).slice(0, 20);
    }
  }

  selectForecastSupplierFilter(supplier: StatisticsSupplier | null): void {
    if (supplier) {
      this.forecastSupplierId = supplier._id;
      this.forecastSupplierSearchQuery = '';
    } else {
      this.forecastSupplierId = 'all';
      this.forecastSupplierSearchQuery = '';
    }
    this.showForecastSupplierDropdown = false;
    this.loadEndingForecast();
  }

  clearForecastSupplierSelection(): void {
    this.forecastSupplierId = 'all';
    this.forecastSupplierSearchQuery = '';
    this.loadEndingForecast();
  }

  closeForecastSupplierDropdownDelayed(): void {
    setTimeout(() => {
      this.showForecastSupplierDropdown = false;
    }, 200);
  }

  getForecastSelectedSupplierName(): string | null {
    if (this.forecastSupplierId === 'all' || !this.forecastData?.suppliers) {
      return null;
    }
    const supplier = this.forecastData.suppliers.find(s => s._id === this.forecastSupplierId);
    return supplier ? (supplier.shortName || supplier.name) : null;
  }

  getForecastBarHeight(value: number): number {
    if (!this.forecastData?.endingContractsByMonth?.data) return 5;
    const maxValue = Math.max(...this.forecastData.endingContractsByMonth.data, 1);
    if (value === 0) return 5;
    return Math.max((value / maxValue) * 100, 10);
  }

  hasForecastEndingContracts(): boolean {
    return this.forecastData?.endingContractsByMonth?.data?.some(d => d > 0) ?? false;
  }

  getStatusColor(status: string): string {
    return this.statusColors[status] || '#6c757d';
  }

  getTotalForMonth(monthIndex: number): number {
    if (!this.contractStats) return 0;
    return this.contractStats.chartData.datasets.reduce((sum, dataset) => {
      return sum + dataset.data[monthIndex];
    }, 0);
  }

  getContractStatValue(stats: { draft: number; active: number; ended: number; archived: number; total: number }, status: string): number {
    return stats[status as keyof typeof stats] || 0;
  }

  getBarHeight(value: number): number {
    if (this.maxChartValue === 0) return 0;
    return (value / this.maxChartValue) * 100;
  }

  getEndingBarHeight(value: number): number {
    if (!this.contractStats?.endingContractsByMonth?.data) return 5;
    const maxValue = Math.max(...this.contractStats.endingContractsByMonth.data, 1);
    // Mindestens 5% Höhe für sichtbare Balken, auch wenn value 0 ist
    if (value === 0) return 5;
    return Math.max((value / maxValue) * 100, 10);
  }

  hasEndingContracts(): boolean {
    return this.contractStats?.endingContractsByMonth?.data?.some(d => d > 0) ?? false;
  }

  getDaysRemaining(endDate: string): number {
    const end = new Date(endDate);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getDaysOverdue(endDate: string): number {
    const end = new Date(endDate);
    const today = new Date();
    const diff = today.getTime() - end.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getPercentage(count: number): number {
    return (count / this.maxContracts) * 100;
  }

  // Berechnet die Gesamtanzahl aller Verträge bei Anbietern
  getTotalSupplierContracts(): number {
    if (!this.stats?.contractsBySupplier) return 0;
    return this.stats.contractsBySupplier.reduce((sum: number, item: { count: number }) => sum + item.count, 0);
  }

  // Berechnet den Prozentsatz eines Anbieters
  getSupplierPercentage(count: number): number {
    const total = this.getTotalSupplierContracts();
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }

  // Farben für Kreisdiagramm
  supplierColors: string[] = [
    '#667eea', '#764ba2', '#11998e', '#38ef7d', '#f093fb',
    '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a',
    '#fee140', '#fa709a', '#6a11cb', '#2575fc'
  ];

  getSupplierColor(index: number): string {
    return this.supplierColors[index % this.supplierColors.length];
  }

  // Berechnet den conic-gradient für das Kreisdiagramm
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

  // Favorit-Statistiken Methoden
  loadFavoriteStats(): void {
    this.favoriteStats = this.settingsService.getFavoriteStats();
  }

  isFavorite(statId: string): boolean {
    return this.favoriteStats.includes(statId);
  }

  toggleFavorite(statId: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    this.settingsService.toggleFavorite(statId).subscribe({
      next: () => {
        this.favoriteStats = this.settingsService.getFavoriteStats();
      },
      error: (error) => {
        console.error('Error toggling favorite:', error);
        this.toastService.error('Fehler beim Speichern der Favoriten');
      }
    });
  }

  getFavoriteStatCards(): StatCard[] {
    return this.availableStatCards.filter(card => this.favoriteStats.includes(card.id));
  }

  getNonFavoriteStatCards(): StatCard[] {
    return this.availableStatCards.filter(card => !this.favoriteStats.includes(card.id));
  }

  onToggleFavoriteFromMobile(statId: string): void {
    this.settingsService.toggleFavorite(statId).subscribe({
      next: () => {
        this.favoriteStats = this.settingsService.getFavoriteStats();
      },
      error: (error) => {
        console.error('Error toggling favorite:', error);
        this.toastService.error('Fehler beim Speichern der Favoriten');
      }
    });
  }

  // Überfällige Verträge Modal
  openOverdueModal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.stats?.overdueContracts?.count > 0) {
      this.showOverdueModal = true;
    }
  }

  closeOverdueModal(): void {
    this.showOverdueModal = false;
  }

  navigateToContract(contractId: string): void {
    this.closeOverdueModal();
    this.router.navigate(['/contracts'], { queryParams: { id: contractId } });
  }
}
