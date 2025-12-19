import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>

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
  `]
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  maxContracts = 0;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadStats();
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

  getDaysRemaining(endDate: string): number {
    const end = new Date(endDate);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getPercentage(count: number): number {
    return (count / this.maxContracts) * 100;
  }
}
