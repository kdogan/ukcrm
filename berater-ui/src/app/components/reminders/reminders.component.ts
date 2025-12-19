import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContractService } from '../../services/contract.service';
import { MeterService } from '../../services/meter.service';
import { ReminderService } from '../../services/reminder.service';

// CONTRACTS COMPONENT
@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h1>Verträge</h1>
      <div class="filters">
        <select [(ngModel)]="statusFilter" (ngModelChange)="loadContracts()">
          <option value="">Alle</option>
          <option value="active">Aktiv</option>
          <option value="ended">Beendet</option>
          <option value="archived">Archiviert</option>
        </select>
        <select [(ngModel)]="daysFilter" (ngModelChange)="loadContracts()">
          <option value="">Alle Laufzeiten</option>
          <option value="30">Nächste 30 Tage</option>
          <option value="60">Nächste 60 Tage</option>
          <option value="90">Nächste 90 Tage</option>
        </select>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Vertragsnr.</th>
              <th>Kunde</th>
              <th>Anbieter</th>
              <th>Startdatum</th>
              <th>Enddatum</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let contract of contracts">
              <td>{{ contract.contractNumber }}</td>
              <td>{{ contract.customerId?.firstName }} {{ contract.customerId?.lastName }}</td>
              <td>{{ contract.supplierId?.name }}</td>
              <td>{{ contract.startDate | date:'dd.MM.yyyy' }}</td>
              <td>{{ contract.endDate | date:'dd.MM.yyyy' }}</td>
              <td><span class="badge">{{ contract.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; }
    .filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    select { padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; }
    .table-container { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f8f9fa; padding: 1rem; text-align: left; font-weight: 600; }
    .data-table td { padding: 1rem; border-top: 1px solid #eee; }
    .badge { padding: 0.25rem 0.75rem; border-radius: 12px; background: #e8f5e9; color: #2e7d32; font-size: 0.875rem; }
  `]
})
export class ContractsComponent implements OnInit {
  contracts: any[] = [];
  statusFilter = '';
  daysFilter = '';

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    const params: any = {};
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.daysFilter) params.daysRemaining = this.daysFilter;

    this.contractService.getContracts(params).subscribe({
      next: (response) => {
        if (response.success) this.contracts = response.data;
      }
    });
  }
}

// METERS COMPONENT
@Component({
  selector: 'app-meters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h1>Zähler</h1>
      <div class="filters">
        <select [(ngModel)]="statusFilter" (ngModelChange)="loadMeters()">
          <option value="">Alle</option>
          <option value="free">Frei</option>
          <option value="occupied">Belegt</option>
        </select>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Zählernummer</th>
              <th>Typ</th>
              <th>Status</th>
              <th>Aktueller Kunde</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let meter of meters">
              <td>{{ meter.meterNumber }}</td>
              <td>{{ getTypeLabel(meter.type) }}</td>
              <td>
                <span class="badge" [class.badge-free]="!meter.currentCustomerId">
                  {{ meter.currentCustomerId ? 'Belegt' : 'Frei' }}
                </span>
              </td>
              <td>
                {{ meter.currentCustomerId ? 
                   (meter.currentCustomerId.firstName + ' ' + meter.currentCustomerId.lastName) : '-' }}
              </td>
              <td>
                <button class="btn-small" (click)="viewHistory(meter._id)">Historie</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; }
    .filters { margin-bottom: 1.5rem; }
    select { padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; }
    .table-container { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f8f9fa; padding: 1rem; text-align: left; font-weight: 600; }
    .data-table td { padding: 1rem; border-top: 1px solid #eee; }
    .badge { padding: 0.25rem 0.75rem; border-radius: 12px; background: #ffebee; color: #c62828; font-size: 0.875rem; }
    .badge-free { background: #e8f5e9; color: #2e7d32; }
    .btn-small { padding: 0.4rem 0.8rem; font-size: 0.875rem; background: #f0f0f0; border: none; border-radius: 6px; cursor: pointer; }
  `]
})
export class MetersComponent implements OnInit {
  meters: any[] = [];
  statusFilter = '';

  constructor(private meterService: MeterService) {}

  ngOnInit(): void {
    this.loadMeters();
  }

  loadMeters(): void {
    const params = this.statusFilter ? { status: this.statusFilter } : {};
    this.meterService.getMeters(params).subscribe({
      next: (response) => {
        if (response.success) this.meters = response.data;
      }
    });
  }

  getTypeLabel(type: string): string {
    const labels: any = { electricity: 'Strom', gas: 'Gas', water: 'Wasser' };
    return labels[type] || type;
  }

  viewHistory(meterId: string): void {
    alert('Historie-Ansicht für Zähler: ' + meterId);
  }
}

// REMINDERS COMPONENT
@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Erinnerungen</h1>
      <div class="reminders-grid">
        <div *ngFor="let reminder of reminders" class="reminder-card" [class.high-priority]="isPriority(reminder)">
          <div class="reminder-header">
            <span class="reminder-type">{{ getTypeLabel(reminder.reminderType) }}</span>
            <span class="reminder-date">{{ reminder.dueDate | date:'dd.MM.yyyy' }}</span>
          </div>
          <div class="reminder-body">
            <h3>{{ reminder.contractId?.customerId?.firstName }} {{ reminder.contractId?.customerId?.lastName }}</h3>
            <p>Anbieter: {{ reminder.contractId?.supplierId?.name }}</p>
            <p>Vertrag: {{ reminder.contractId?.contractNumber }}</p>
          </div>
          <button class="btn-done" (click)="markDone(reminder._id)">Als erledigt markieren</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; }
    .reminders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
    .reminder-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #667eea; }
    .reminder-card.high-priority { border-left-color: #e74c3c; }
    .reminder-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
    .reminder-type { font-weight: 600; color: #667eea; }
    .reminder-date { color: #888; font-size: 0.9rem; }
    .reminder-body h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
    .reminder-body p { margin: 0.25rem 0; color: #666; font-size: 0.9rem; }
    .btn-done { margin-top: 1rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%; }
  `]
})
export class RemindersComponent implements OnInit {
  reminders: any[] = [];

  constructor(private reminderService: ReminderService) {}

  ngOnInit(): void {
    this.loadReminders();
  }

  loadReminders(): void {
    this.reminderService.getReminders('open').subscribe({
      next: (response) => {
        if (response.success) this.reminders = response.data;
      }
    });
  }

  getTypeLabel(type: string): string {
    const labels: any = { '90days': '90 Tage', '60days': '60 Tage', '30days': '30 Tage' };
    return labels[type] || type;
  }

  isPriority(reminder: any): boolean {
    const days = Math.ceil((new Date(reminder.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 30;
  }

  markDone(id: string): void {
    this.reminderService.markAsDone(id).subscribe({
      next: () => this.loadReminders()
    });
  }
}
