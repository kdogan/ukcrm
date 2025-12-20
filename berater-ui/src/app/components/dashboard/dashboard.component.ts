import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>

      <!-- Superadmin Dashboard -->
      <div *ngIf="isSuperAdmin">
        <div class="stats-grid" *ngIf="userStats">
          <!-- Gesamt Benutzer -->
          <div class="stat-card">
            <h3>👥 Benutzer</h3>
            <div class="stat-number">{{ userStats.total || 0 }}</div>
            <div class="stat-label">Gesamt</div>
          </div>

          <!-- Aktive Benutzer -->
          <div class="stat-card">
            <h3>✅ Aktive</h3>
            <div class="stat-number">{{ userStats.active || 0 }}</div>
            <div class="stat-label">Aktive Benutzer</div>
          </div>

          <!-- Blockierte Benutzer -->
          <div class="stat-card">
            <h3>🚫 Blockiert</h3>
            <div class="stat-number">{{ userStats.blocked || 0 }}</div>
            <div class="stat-label">Blockierte Benutzer</div>
          </div>
        </div>

        <!-- Benutzer nach Rolle -->
        <div class="supplier-section" *ngIf="userStats?.byRole">
          <h2>📊 Benutzer nach Rolle</h2>
          <div class="chart-container">
            <div *ngFor="let item of getRoleStats()" class="chart-bar">
              <div class="bar-label">{{ item.name }}</div>
              <div class="bar-wrapper">
                <div class="bar" [style.width.%]="getPercentage(item.count)"></div>
                <span class="bar-value">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Benutzer nach Paket -->
        <div class="supplier-section" *ngIf="userStats?.byPackage">
          <h2>📦 Benutzer nach Paket</h2>
          <div class="chart-container">
            <div *ngFor="let item of getPackageStats()" class="chart-bar">
              <div class="bar-label">{{ item.name }}</div>
              <div class="bar-wrapper">
                <div class="bar" [style.width.%]="getPercentage(item.count)"></div>
                <span class="bar-value">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Upgrade-Anfragen -->
        <div class="upgrade-requests-section" *ngIf="stats?.upgradeRequests">
          <h2>🔄 Upgrade-Anfragen</h2>
          <div class="stats-grid" style="margin-bottom: 20px;">
            <div class="stat-card priority-high">
              <h3>⏳ Warten auf Prüfung</h3>
              <div class="stat-number">{{ stats.upgradeRequests.counts?.awaitingReview || 0 }}</div>
              <div class="stat-label">Pending & Payment Received</div>
            </div>
            <div class="stat-card">
              <h3>📝 Pending</h3>
              <div class="stat-number">{{ stats.upgradeRequests.counts?.pending || 0 }}</div>
              <div class="stat-label">Neu erstellt</div>
            </div>
            <div class="stat-card">
              <h3>💰 Payment Received</h3>
              <div class="stat-number">{{ stats.upgradeRequests.counts?.paymentReceived || 0 }}</div>
              <div class="stat-label">Zahlung eingegangen</div>
            </div>
          </div>

          <div *ngIf="stats.upgradeRequests.pending?.length > 0" class="requests-list">
            <h3>Offene Anfragen</h3>
            <div *ngFor="let request of stats.upgradeRequests.pending" class="request-card">
              <div class="request-header">
                <div class="user-info">
                  <strong>{{ request.user.firstName }} {{ request.user.lastName }}</strong>
                  <span class="email">{{ request.user.email }}</span>
                </div>
                <span class="status-badge" [class]="'status-' + request.status">
                  {{ getStatusLabel(request.status) }}
                </span>
              </div>
              <div class="request-details">
                <div class="detail-item">
                  <span class="label">Aktuell:</span>
                  <span class="value">{{ request.currentPackage }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Gewünscht:</span>
                  <span class="value highlight">{{ request.packageDetails.displayName }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Preis:</span>
                  <span class="value">{{ request.packageDetails.price }} {{ request.packageDetails.currency }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Datum:</span>
                  <span class="value">{{ formatDate(request.createdAt) }}</span>
                </div>
              </div>
              <div class="request-actions">
                <button class="btn-success" (click)="approveUpgrade(request._id)">
                  ✓ Genehmigen
                </button>
                <button class="btn-danger" (click)="rejectUpgrade(request._id)">
                  ✗ Ablehnen
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="!stats.upgradeRequests.pending || stats.upgradeRequests.pending.length === 0" class="no-data">
            <p>Keine offenen Upgrade-Anfragen</p>
          </div>
        </div>
      </div>

      <!-- Berater/Admin Dashboard -->
      <div *ngIf="!isSuperAdmin">
        <div class="stats-grid" *ngIf="stats">
          <!-- Erinnerungen -->
          <div class="stat-card priority-high" *ngIf="stats.reminders">
            <h3>🔔 Erinnerungen</h3>
            <div class="reminder-stats">
              <div class="reminder-item high">
                <span class="count">{{ stats.reminders.urgent || 0 }}</span>
                <span class="label">Dringend</span>
              </div>
              <div class="reminder-item medium">
                <span class="count">{{ stats.reminders.total || 0 }}</span>
                <span class="label">Gesamt</span>
              </div>
            </div>
          </div>

          <!-- Kunden -->
          <div class="stat-card">
            <h3>👥 Kunden</h3>
            <div class="stat-number">{{ stats.customers?.active || 0 }}</div>
            <div class="stat-label">Aktive Kunden</div>
          </div>

          <!-- Zähler -->
          <div class="stat-card">
            <h3>⚡ Zähler</h3>
            <div class="stat-split">
              <div>
                <div class="stat-number small">{{ stats.meters?.free || 0 }}</div>
                <div class="stat-label">Frei</div>
              </div>
              <div>
                <div class="stat-number small">{{ stats.meters?.occupied || 0 }}</div>
                <div class="stat-label">Belegt</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Auslaufende Verträge -->
        <div class="contracts-section" *ngIf="stats?.expiringContracts">
          <h2>📋 Bald auslaufende Verträge</h2>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Vertragsnr.</th>
                  <th>Kunde</th>
                  <th>Anbieter</th>
                  <th>Enddatum</th>
                  <th>Restlaufzeit</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let contract of stats.expiringContracts">
                  <td>{{ contract.contractNumber }}</td>
                  <td>{{ contract.customerId.firstName }} {{ contract.customerId.lastName }}</td>
                  <td>{{ contract.supplierId.name }}</td>
                  <td>{{ contract.endDate | date:'dd.MM.yyyy' }}</td>
                  <td>
                    <span class="badge" [class.badge-danger]="getDaysRemaining(contract.endDate) <= 30">
                      {{ getDaysRemaining(contract.endDate) }} Tage
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Verträge nach Anbieter -->
        <div class="supplier-section" *ngIf="stats?.contractsBySupplier">
          <h2>📊 Verträge nach Anbieter</h2>
          <div class="chart-container">
            <div *ngFor="let item of stats.contractsBySupplier" class="chart-bar">
              <div class="bar-label">{{ item.name }}</div>
              <div class="bar-wrapper">
                <div class="bar" [style.width.%]="getPercentage(item.count)"></div>
                <span class="bar-value">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 2rem;
      color: #333;
    }

    h2 {
      font-size: 1.5rem;
      margin: 2rem 0 1rem;
      color: #555;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .stat-card h3 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      color: #666;
    }

    .stat-number {
      font-size: 3rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .stat-number.small {
      font-size: 2rem;
    }

    .stat-label {
      color: #888;
      font-size: 0.9rem;
    }

    .stat-split {
      display: flex;
      gap: 2rem;
      justify-content: space-around;
    }

    .reminder-stats {
      display: flex;
      gap: 1rem;
      justify-content: space-between;
    }

    .reminder-item {
      text-align: center;
      flex: 1;
    }

    .reminder-item .count {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.25rem;
    }

    .reminder-item.high .count { color: #e74c3c; }
    .reminder-item.medium .count { color: #f39c12; }
    .reminder-item.low .count { color: #27ae60; }

    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      background: #f8f9fa;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #555;
    }

    .data-table td {
      padding: 1rem;
      border-top: 1px solid #eee;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      background: #e8f5e9;
      color: #2e7d32;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .badge-danger {
      background: #ffebee;
      color: #c62828;
    }

    .chart-container {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .chart-bar {
      margin-bottom: 1rem;
    }

    .bar-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #555;
    }

    .bar-wrapper {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .bar {
      height: 32px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 6px;
      transition: width 0.3s;
    }

    .bar-value {
      font-weight: 600;
      color: #667eea;
      min-width: 30px;
    }

    /* Upgrade Requests Styles */
    .upgrade-requests-section {
      margin-top: 2rem;
    }

    .requests-list {
      margin-top: 1.5rem;
    }

    .requests-list h3 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      color: #555;
    }

    .request-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .request-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .user-info strong {
      font-size: 1.1rem;
      color: #333;
    }

    .user-info .email {
      color: #666;
      font-size: 0.9rem;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .status-badge.status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.status-payment_received {
      background: #d1ecf1;
      color: #0c5460;
    }

    .status-badge.status-approved {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.status-rejected {
      background: #f8d7da;
      color: #721c24;
    }

    .request-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item .label {
      font-size: 0.875rem;
      color: #888;
    }

    .detail-item .value {
      font-size: 1rem;
      color: #333;
      font-weight: 500;
    }

    .detail-item .value.highlight {
      color: #667eea;
      font-weight: 600;
    }

    .request-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn-success {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }

    .btn-success:hover {
      background: #218838;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .no-data {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      color: #888;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: any = null;
  userStats: any = null;
  maxContracts = 0;
  maxUsers = 0;
  isSuperAdmin = false;
  currentUser: any = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const userSub = this.authService.currentUser$.subscribe(user => {
      if (!user) return; // Ignore null/undefined users

      this.currentUser = user;
      this.isSuperAdmin = user?.role === 'superadmin';

      if (this.isSuperAdmin) {
        this.loadUserStats();
        this.loadStats(); // Load dashboard stats to get upgrade requests
      } else {
        this.loadStats();
      }
    });

    this.subscription.add(userSub);
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
