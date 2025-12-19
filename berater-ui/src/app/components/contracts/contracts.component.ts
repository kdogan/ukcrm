import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContractService } from '../../services/contract.service';
import { CustomerService } from '../../services/customer.service';
import { SupplierService } from '../../services/supplier.service';
import { MeterService } from '../../services/meter.service';
import { ReminderService } from '../../services/reminder.service';

// CONTRACTS COMPONENT
@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Verträge</h1>
        <button class="btn-primary" (click)="showCreateModal()">+ Neuer Vertrag</button>
      </div>
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
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let contract of contracts">
              <td>{{ contract.contractNumber }}</td>
              <td>{{ contract.customerId?.firstName }} {{ contract.customerId?.lastName }}</td>
              <td>{{ contract.supplierId?.name }}</td>
              <td>{{ contract.startDate | date:'dd.MM.yyyy' }}</td>
              <td>{{ contract.endDate | date:'dd.MM.yyyy' }}</td>
              <td><span class="badge" [class.badge-active]="contract.status === 'active'">{{ getStatusLabel(contract.status) }}</span></td>
              <td>
                <button class="btn-small" (click)="editContract(contract)">Bearbeiten</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal for Create/Edit Contract -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditMode ? 'Vertrag bearbeiten' : 'Neuer Vertrag' }}</h2>
            <button class="btn-close" (click)="closeModal()">&times;</button>
          </div>
          <form (ngSubmit)="saveContract()" #contractForm="ngForm">
            <div class="form-group">
              <label for="contractNumber">Vertragsnummer *</label>
              <input
                type="text"
                id="contractNumber"
                name="contractNumber"
                [(ngModel)]="currentContract.contractNumber"
                required
                placeholder="z.B. V-2024-001"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="customerId">Kunde *</label>
              <input
                type="text"
                placeholder="Suche nach Kunden..."
                [(ngModel)]="customerSearch"
                (ngModelChange)="filterCustomers()"
                (focus)="showCustomerDropdown = true"
                class="form-control search-input"
                [ngModelOptions]="{standalone: true}"
                autocomplete="off"
              />
              <div class="dropdown-list" *ngIf="showCustomerDropdown && filteredCustomers.length > 0">
                <div
                  *ngFor="let customer of filteredCustomers"
                  class="dropdown-item"
                  [class.selected]="currentContract.customerId === customer._id"
                  (click)="selectCustomer(customer)"
                >
                  {{ customer.firstName }} {{ customer.lastName }} ({{ customer.customerNumber }})
                </div>
              </div>
              <input type="hidden" id="customerId" name="customerId" [(ngModel)]="currentContract.customerId" required />
              <div class="selected-item" *ngIf="selectedCustomer">
                Ausgewählt: <strong>{{ selectedCustomer.firstName }} {{ selectedCustomer.lastName }}</strong> ({{ selectedCustomer.customerNumber }})
                <button type="button" class="btn-clear" (click)="clearCustomer()">&times;</button>
              </div>
            </div>

            <div class="form-group">
              <label for="meterId">Zähler *</label>
              <input
                type="text"
                placeholder="Suche nach Zählernummer..."
                [(ngModel)]="meterSearch"
                (ngModelChange)="filterMeters()"
                (focus)="showMeterDropdown = true"
                class="form-control search-input"
                [ngModelOptions]="{standalone: true}"
                autocomplete="off"
              />
              <div class="dropdown-list" *ngIf="showMeterDropdown && filteredFreeMeters.length > 0">
                <div
                  *ngFor="let meter of filteredFreeMeters"
                  class="dropdown-item"
                  [class.selected]="currentContract.meterId === meter._id"
                  [class.occupied]="!isMeterFree(meter)"
                  [class.disabled]="!isMeterFree(meter)"
                  (click)="isMeterFree(meter) && selectMeter(meter)"
                  [style.cursor]="isMeterFree(meter) ? 'pointer' : 'not-allowed'"
                >
                  {{ meter.meterNumber }} ({{ getTypeLabel(meter.type) }})
                  <span *ngIf="!isMeterFree(meter)" style="color: #c62828; font-weight: bold; margin-left: 0.5rem;">- Belegt</span>
                </div>
              </div>
              <input type="hidden" id="meterId" name="meterId" [(ngModel)]="currentContract.meterId" required />
              <div class="selected-item" *ngIf="selectedMeter">
                Ausgewählt: <strong>{{ selectedMeter.meterNumber }}</strong> ({{ getTypeLabel(selectedMeter.type) }})
                <button type="button" class="btn-clear" (click)="clearMeter()">&times;</button>
              </div>
            </div>

            <div class="form-group">
              <label for="supplierId">Anbieter *</label>
              <select
                id="supplierId"
                name="supplierId"
                [(ngModel)]="currentContract.supplierId"
                required
                class="form-control"
              >
                <option value="">Bitte wählen</option>
                <option *ngFor="let supplier of suppliers" [value]="supplier._id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="startDate">Startdatum *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  [(ngModel)]="currentContract.startDate"
                  required
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="durationMonths">Laufzeit (Monate) *</label>
                <input
                  type="number"
                  id="durationMonths"
                  name="durationMonths"
                  [(ngModel)]="currentContract.durationMonths"
                  required
                  min="1"
                  max="120"
                  placeholder="z.B. 24"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="status">Status</label>
              <select
                id="status"
                name="status"
                [(ngModel)]="currentContract.status"
                class="form-control"
              >
                <option value="active">Aktiv</option>
                <option value="ended">Beendet</option>
                <option value="archived">Archiviert</option>
              </select>
            </div>

            <div class="form-group">
              <label for="notes">Notizen</label>
              <textarea
                id="notes"
                name="notes"
                [(ngModel)]="currentContract.notes"
                rows="3"
                placeholder="Optional: Zusätzliche Informationen zum Vertrag"
                class="form-control"
              ></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeModal()">Abbrechen</button>
              <button type="submit" class="btn-primary" [disabled]="!contractForm.form.valid || !isFormValid()">
                {{ isEditMode ? 'Speichern' : 'Erstellen' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    h1 { font-size: 2rem; margin: 0; }
    .filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    select { padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; }
    .table-container { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f8f9fa; padding: 1rem; text-align: left; font-weight: 600; }
    .data-table td { padding: 1rem; border-top: 1px solid #eee; }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      background: #ffebee;
      color: #c62828;
      font-size: 0.875rem;
    }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .btn-primary, .btn-secondary, .btn-small {
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover { background: #5568d3; }
    .btn-secondary {
      background: #e0e0e0;
      color: #555;
    }
    .btn-small {
      padding: 0.4rem 0.8rem;
      font-size: 0.875rem;
      margin-right: 0.5rem;
      background: #f0f0f0;
      color: #555;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      width: 90%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e0e0e0;
    }
    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #888;
      line-height: 1;
      padding: 0;
      width: 30px;
      height: 30px;
    }
    .btn-close:hover { color: #333; }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #555;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }
    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }
    textarea.form-control {
      resize: vertical;
      font-family: inherit;
    }
    .search-input {
      margin-bottom: 0.5rem;
      border-color: #667eea;
      background-color: #f8f9ff;
    }
    .dropdown-list {
      position: relative;
      max-height: 200px;
      overflow-y: auto;
      border: 2px solid #667eea;
      border-radius: 8px;
      margin-top: 0.5rem;
      background: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10;
    }
    .dropdown-item {
      padding: 0.75rem;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;
    }
    .dropdown-item:hover {
      background-color: #f8f9ff;
    }
    .dropdown-item.selected {
      background-color: #e8f0fe;
      font-weight: 600;
    }
    .dropdown-item.occupied {
      background-color: #ffebee;
      color: #c62828;
    }
    .dropdown-item.disabled {
      opacity: 0.6;
    }
    .dropdown-item.disabled:hover {
      background-color: #ffebee;
    }
    .dropdown-item:last-child {
      border-bottom: none;
    }
    .selected-item {
      margin-top: 0.5rem;
      padding: 0.75rem;
      background-color: #e8f5e9;
      border: 2px solid #4caf50;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-clear {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #666;
      cursor: pointer;
      padding: 0;
      margin-left: 0.5rem;
      line-height: 1;
    }
    .btn-clear:hover {
      color: #c62828;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 2px solid #e0e0e0;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ContractsComponent implements OnInit {
  contracts: any[] = [];
  customers: any[] = [];
  suppliers: any[] = [];
  freeMeters: any[] = [];
  filteredCustomers: any[] = [];
  filteredFreeMeters: any[] = [];
  statusFilter = '';
  daysFilter = '';
  showModal = false;
  isEditMode = false;
  currentContract: any = this.getEmptyContract();
  customerSearch = '';
  meterSearch = '';
  showCustomerDropdown = false;
  showMeterDropdown = false;
  selectedCustomer: any = null;
  selectedMeter: any = null;

  constructor(
    private contractService: ContractService,
    private customerService: CustomerService,
    private supplierService: SupplierService,
    private meterService: MeterService
  ) {}

  ngOnInit(): void {
    this.loadContracts();
    this.loadCustomers();
    this.loadSuppliers();
    this.loadFreeMeters();
  }

  getEmptyContract(): any {
    return {
      contractNumber: '',
      customerId: '',
      meterId: '',
      supplierId: '',
      startDate: '',
      durationMonths: 24,
      status: 'active',
      notes: ''
    };
  }

  loadContracts(): void {
    const params: any = {};
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.daysFilter) params.daysRemaining = this.daysFilter;

    this.contractService.getContracts(params).subscribe({
      next: (response: any) => {
        if (response.success) this.contracts = response.data;
      }
    });
  }

  loadCustomers(): void {
    this.customerService.getCustomers({ isActive: true, limit: 1000 }).subscribe({
      next: (response) => {
        if (response.success) {
          this.customers = response.data;
          this.filteredCustomers = response.data;
        }
      }
    });
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers({ isActive: true, limit: 1000 }).subscribe({
      next: (response) => {
        if (response.success) this.suppliers = response.data;
      }
    });
  }

  loadFreeMeters(): void {
    // Lade alle Zähler (nicht nur freie), um anzuzeigen welche belegt sind
    this.meterService.getMeters({ limit: 1000 }).subscribe({
      next: (response) => {
        if (response.success) {
          this.freeMeters = response.data;
          this.filteredFreeMeters = response.data;
        }
      }
    });
  }

  filterCustomers(): void {
    const search = this.customerSearch.toLowerCase().trim();
    if (!search) {
      this.filteredCustomers = this.customers;
    } else {
      this.filteredCustomers = this.customers.filter(customer => {
        const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
        const customerNumber = customer.customerNumber?.toLowerCase() || '';
        return fullName.includes(search) || customerNumber.includes(search);
      });
    }
    this.showCustomerDropdown = true;
  }

  filterMeters(): void {
    const search = this.meterSearch.toLowerCase().trim();
    if (!search) {
      this.filteredFreeMeters = this.freeMeters;
    } else {
      this.filteredFreeMeters = this.freeMeters.filter(meter => {
        const meterNumber = meter.meterNumber?.toLowerCase() || '';
        const type = this.getTypeLabel(meter.type).toLowerCase();
        return meterNumber.includes(search) || type.includes(search);
      });
    }
    this.showMeterDropdown = true;
  }

  selectCustomer(customer: any): void {
    this.selectedCustomer = customer;
    this.currentContract.customerId = customer._id;
    this.customerSearch = `${customer.firstName} ${customer.lastName} (${customer.customerNumber})`;
    this.showCustomerDropdown = false;
  }

  selectMeter(meter: any): void {
    this.selectedMeter = meter;
    this.currentContract.meterId = meter._id;
    this.meterSearch = `${meter.meterNumber} (${this.getTypeLabel(meter.type)})`;
    this.showMeterDropdown = false;
  }

  clearCustomer(): void {
    this.selectedCustomer = null;
    this.currentContract.customerId = '';
    this.customerSearch = '';
    this.filteredCustomers = this.customers;
  }

  clearMeter(): void {
    this.selectedMeter = null;
    this.currentContract.meterId = '';
    this.meterSearch = '';
    this.filteredFreeMeters = this.freeMeters;
  }

  showCreateModal(): void {
    this.isEditMode = false;
    this.currentContract = this.getEmptyContract();
    this.customerSearch = '';
    this.meterSearch = '';
    this.selectedCustomer = null;
    this.selectedMeter = null;
    this.showCustomerDropdown = false;
    this.showMeterDropdown = false;
    this.filteredCustomers = this.customers;
    this.filteredFreeMeters = this.freeMeters;
    this.showModal = true;
  }

  editContract(contract: any): void {
    this.isEditMode = true;
    this.currentContract = {
      ...contract,
      customerId: contract.customerId?._id || contract.customerId,
      meterId: contract.meterId?._id || contract.meterId,
      supplierId: contract.supplierId?._id || contract.supplierId,
      startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : ''
    };

    // Set selected customer and meter for editing
    this.selectedCustomer = contract.customerId;
    this.selectedMeter = contract.meterId;

    this.customerSearch = '';
    this.meterSearch = '';
    this.showCustomerDropdown = false;
    this.showMeterDropdown = false;
    this.filteredCustomers = this.customers;
    this.filteredFreeMeters = this.freeMeters;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentContract = this.getEmptyContract();
  }

  saveContract(): void {
    if (this.isEditMode) {
      this.contractService.updateContract(this.currentContract._id, this.currentContract).subscribe({
        next: (response) => {
          if (response.success) {
            this.closeModal();
            this.loadContracts();
          }
        },
        error: (error) => {
          alert('Fehler beim Aktualisieren des Vertrags: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    } else {
      this.contractService.createContract(this.currentContract).subscribe({
        next: (response) => {
          if (response.success) {
            this.closeModal();
            this.loadContracts();
            this.loadFreeMeters();
          }
        },
        error: (error) => {
          alert('Fehler beim Erstellen des Vertrags: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      active: 'Aktiv',
      ended: 'Beendet',
      archived: 'Archiviert'
    };
    return labels[status] || status;
  }

  getTypeLabel(type: string): string {
    const labels: any = { electricity: 'Strom', gas: 'Gas', water: 'Wasser' };
    return labels[type] || type;
  }

  isMeterFree(meter: any): boolean {
    return !meter.currentCustomerId;
  }

  isFormValid(): boolean {
    // Prüfe ob der ausgewählte Zähler frei ist
    if (this.selectedMeter && !this.isMeterFree(this.selectedMeter)) {
      return false;
    }
    return true;
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
