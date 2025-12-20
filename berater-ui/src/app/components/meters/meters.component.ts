import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { MeterService } from '../../services/meter.service';
import { ReminderService } from '../../services/reminder.service';
import { CustomerService } from '../../services/customer.service';
import { SupplierService } from '../../services/supplier.service';
import { MeterReadingService } from '../../services/meter-reading.service';

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
              <select
                id="customerId"
                name="customerId"
                [(ngModel)]="currentContract.customerId"
                required
                class="form-control"
              >
                <option value="">Bitte wählen</option>
                <option *ngFor="let customer of customers" [value]="customer._id">
                  {{ customer.firstName }} {{ customer.lastName }} ({{ customer.customerNumber }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="meterId">Zähler *</label>
              <select
                id="meterId"
                name="meterId"
                [(ngModel)]="currentContract.meterId"
                required
                class="form-control"
              >
                <option value="">Bitte wählen</option>
                <option *ngFor="let meter of freeMeters" [value]="meter._id">
                  {{ meter.meterNumber }} ({{ getTypeLabel(meter.type) }})
                </option>
              </select>
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
              <button type="submit" class="btn-primary" [disabled]="!contractForm.form.valid">
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
  statusFilter = '';
  daysFilter = '';
  showModal = false;
  isEditMode = false;
  currentContract: any = this.getEmptyContract();

  constructor(
    private contractService: ContractService,
    private customerService: CustomerService,
    private supplierService: SupplierService,
    private meterService: MeterService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Lade immer Kunden, Lieferanten und freie Zähler
    this.loadCustomers();
    this.loadSuppliers();
    this.loadFreeMeters();

    // Prüfe ob eine ID in der Route vorhanden ist
    this.route.params.subscribe(params => {
      const contractId = params['id'];
      console.log('ContractsComponent - Route params:', params);
      console.log('ContractsComponent - Contract ID:', contractId);

      if (contractId) {
        // Zeige Vertrag bearbeiten Modal
        console.log('ContractsComponent - Loading contract by ID:', contractId);
        this.loadContractById(contractId);
      } else {
        console.log('ContractsComponent - Loading all contracts');
        this.loadContracts();
      }
    });
  }

  loadContractById(id: string): void {
    console.log('loadContractById called with ID:', id);
    // Lade zuerst die Vertragsliste
    this.loadContracts();

    // Dann lade den spezifischen Vertrag und öffne das Modal
    this.contractService.getContract(id).subscribe({
      next: (response) => {
        console.log('Contract loaded from backend:', response);
        if (response.success) {
          const contract = response.data;
          this.currentContract = {
            _id: contract._id,
            contractNumber: contract.contractNumber,
            customerId: contract.customerId?._id || contract.customerId,
            meterId: contract.meterId?._id || contract.meterId,
            supplierId: contract.supplierId?._id || contract.supplierId,
            startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
            durationMonths: contract.durationMonths,
            status: contract.status,
            notes: contract.notes || ''
          };
          console.log('Setting currentContract:', this.currentContract);
          console.log('Opening modal - isEditMode:', true, 'showModal:', true);
          this.isEditMode = true;
          this.showModal = true;
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden des Vertrags:', error);
        alert('Vertrag konnte nicht geladen werden: ' + (error.error?.message || error.message));
      }
    });
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
      next: (response) => {
        if (response.success) this.contracts = response.data;
      }
    });
  }

  loadCustomers(): void {
    this.customerService.getCustomers({ isActive: true, limit: 1000 }).subscribe({
      next: (response) => {
        if (response.success) this.customers = response.data;
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
    this.meterService.getMeters({ status: 'free', limit: 1000 }).subscribe({
      next: (response) => {
        if (response.success) this.freeMeters = response.data;
      }
    });
  }

  showCreateModal(): void {
    this.isEditMode = false;
    this.currentContract = this.getEmptyContract();
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
}

// METERS COMPONENT
@Component({
  selector: 'app-meters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container" (click)="closeActionMenu()">
      <div class="page-header">
        <h1>Zähler</h1>
        <button class="btn-primary" (click)="showCreateModal()">+ Neuer Zähler</button>
      </div>

      <div class="filters">
        <input
          type="search"
          placeholder="Suche nach Zählernummer..."
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearchChange()"
          class="search-input"
        />
        <select [(ngModel)]="statusFilter" (ngModelChange)="loadMeters()" class="filter-select">
          <option value="">Alle Status</option>
          <option value="free">Frei</option>
          <option value="occupied">Belegt</option>
        </select>
        <select [(ngModel)]="typeFilter" (ngModelChange)="loadMeters()" class="filter-select">
          <option value="">Alle Typen</option>
          <option value="electricity">Strom</option>
          <option value="gas">Gas</option>
          <option value="water">Wasser</option>
        </select>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Zählernummer</th>
              <th>Typ</th>
              <th>Status</th>
              <th>Aktueller Zählerstand</th>
              <th>Letzte Ablesung</th>
              <th>Aktueller Kunde</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let meter of filteredMeters">
              <td>{{ meter.meterNumber }}</td>
              <td>{{ getTypeLabel(meter.type) }}</td>
              <td>
                <span class="badge" [class.badge-active]="!meter.currentCustomerId">
                  {{ meter.currentCustomerId ? 'Belegt' : 'Frei' }}
                </span>
              </td>
              <td>
                <strong>{{ meter.currentReading || '-' }}</strong>
              </td>
              <td>
                {{ meter.lastReadingDate ? (meter.lastReadingDate | date:'dd.MM.yyyy') : '-' }}
              </td>
              <td>
                {{ meter.currentCustomerId ?
                   (meter.currentCustomerId.firstName + ' ' + meter.currentCustomerId.lastName) : '-' }}
              </td>
              <td class="actions-cell">
                <div class="action-menu-container">
                  <button class="action-menu-btn" (click)="toggleActionMenu(meter._id); $event.stopPropagation()">
                    ⋮
                  </button>
                  <div class="action-menu" *ngIf="activeMenuId === meter._id" (click)="$event.stopPropagation()">
                    <button class="menu-item" (click)="showAddReadingModal(meter); closeActionMenu()">
                      📊 Ablesung hinzufügen
                    </button>
                    <button class="menu-item" (click)="viewReadings(meter); closeActionMenu()">
                      📋 Ablesungen anzeigen
                    </button>
                    <button class="menu-item" (click)="editMeter(meter); closeActionMenu()">
                      ✏️ Bearbeiten
                    </button>
                    <button class="menu-item menu-item-danger" (click)="deleteMeter(meter._id); closeActionMenu()">
                      🗑️ Löschen
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal for Create/Edit Meter -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditMode ? 'Zähler bearbeiten' : 'Neuer Zähler' }}</h2>
            <button class="btn-close" (click)="closeModal()">&times;</button>
          </div>
          <form (ngSubmit)="saveMeter()" #meterForm="ngForm">
            <div class="form-group">
              <label for="meterNumber">Zählernummer *</label>
              <input
                type="text"
                id="meterNumber"
                name="meterNumber"
                [(ngModel)]="currentMeter.meterNumber"
                required
                placeholder="z.B. Z-2024-001"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="type">Typ *</label>
              <select
                id="type"
                name="type"
                [(ngModel)]="currentMeter.type"
                required
                class="form-control"
              >
                <option value="">Bitte wählen</option>
                <option value="electricity">Strom</option>
                <option value="gas">Gas</option>
                <option value="water">Wasser</option>
              </select>
            </div>

            <div class="form-group">
              <label for="manufacturer">Hersteller</label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                [(ngModel)]="currentMeter.manufacturer"
                placeholder="z.B. Siemens"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="yearBuilt">Baujahr</label>
              <input
                type="number"
                id="yearBuilt"
                name="yearBuilt"
                [(ngModel)]="currentMeter.yearBuilt"
                [min]="1950"
                [max]="currentYear"
                placeholder="z.B. 2020"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>Standort</label>
              <input
                type="text"
                name="street"
                [(ngModel)]="currentMeter.location.street"
                placeholder="Straße"
                class="form-control"
              />
              <div class="form-row">
                <input
                  type="text"
                  name="zip"
                  [(ngModel)]="currentMeter.location.zip"
                  placeholder="PLZ"
                  class="form-control"
                />
                <input
                  type="text"
                  name="city"
                  [(ngModel)]="currentMeter.location.city"
                  placeholder="Stadt"
                  class="form-control"
                />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeModal()">Abbrechen</button>
              <button type="submit" class="btn-primary" [disabled]="!meterForm.form.valid">
                {{ isEditMode ? 'Speichern' : 'Erstellen' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal for Adding Reading -->
      <div class="modal-overlay" *ngIf="showReadingModal" (click)="closeReadingModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Neue Ablesung für {{ selectedMeter?.meterNumber }}</h2>
            <button class="btn-close" (click)="closeReadingModal()">&times;</button>
          </div>
          <form (ngSubmit)="saveReading()" #readingForm="ngForm">
            <div class="form-group">
              <label for="readingValue">Zählerstand *</label>
              <input
                type="number"
                id="readingValue"
                name="readingValue"
                [(ngModel)]="currentReading.readingValue"
                required
                min="0"
                step="0.01"
                placeholder="z.B. 12345"
                class="form-control"
              />
              <small *ngIf="selectedMeter?.currentReading" style="color: #666;">
                Letzter Zählerstand: {{ selectedMeter.currentReading }}
              </small>
            </div>

            <div class="form-group">
              <label for="readingDate">Ablesedatum *</label>
              <input
                type="date"
                id="readingDate"
                name="readingDate"
                [(ngModel)]="currentReading.readingDate"
                required
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="readingType">Typ</label>
              <select
                id="readingType"
                name="readingType"
                [(ngModel)]="currentReading.readingType"
                class="form-control"
              >
                <option value="initial">Erstablesung</option>
                <option value="regular">Reguläre Ablesung</option>
                <option value="final">Schlussablesung</option>
                <option value="special">Sonderablesung</option>
              </select>
            </div>

            <div class="form-group">
              <label for="notes">Notizen</label>
              <textarea
                id="notes"
                name="notes"
                [(ngModel)]="currentReading.notes"
                rows="3"
                placeholder="Optional: Zusätzliche Informationen"
                class="form-control"
              ></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeReadingModal()">Abbrechen</button>
              <button type="submit" class="btn-primary" [disabled]="!readingForm.form.valid">
                Speichern
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal for Viewing Readings -->
      <div class="modal-overlay" *ngIf="showReadingsListModal" (click)="closeReadingsListModal()">
        <div class="modal-content modal-wide" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Ablesungen für {{ selectedMeter?.meterNumber }}</h2>
            <button class="btn-close" (click)="closeReadingsListModal()">&times;</button>
          </div>

          <div class="readings-list">
            <div *ngIf="meterReadings.length === 0" class="no-data">
              Keine Ablesungen vorhanden
            </div>

            <table class="data-table" *ngIf="meterReadings.length > 0">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Zählerstand</th>
                  <th>Verbrauch</th>
                  <th>Typ</th>
                  <th>Notizen</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let reading of meterReadings">
                  <td>{{ reading.readingDate | date:'dd.MM.yyyy' }}</td>
                  <td><strong>{{ reading.readingValue }}</strong></td>
                  <td>
                    <span *ngIf="reading.consumption">
                      {{ reading.consumption }} ({{ reading.daysSinceLastReading }} Tage)
                    </span>
                    <span *ngIf="!reading.consumption">-</span>
                  </td>
                  <td>{{ getReadingTypeLabel(reading.readingType) }}</td>
                  <td>{{ reading.notes || '-' }}</td>
                  <td>
                    <button class="btn-small btn-danger" (click)="deleteReading(reading._id)">
                      Löschen
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="closeReadingsListModal()">
              Schließen
            </button>
          </div>
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
    h1 { font-size: 2rem; color: #333; margin: 0; }
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .search-input, .filter-select {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
    }
    .search-input {
      flex: 1;
      max-width: 400px;
    }
    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      background: #f8f9fa;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #555;
    }
    .data-table td { padding: 1rem; border-top: 1px solid #eee; }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      background: #ffebee;
      color: #c62828;
      font-size: 0.875rem;
    }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .btn-primary, .btn-secondary, .btn-small, .btn-danger {
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
    .btn-danger {
      background: #ffebee;
      color: #c62828;
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
      max-width: 600px;
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
    .form-row {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 1rem;
      margin-top: 0.5rem;
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
    .modal-wide {
      max-width: 900px;
    }
    .no-data {
      text-align: center;
      padding: 3rem 2rem;
      color: #888;
      font-size: 1.1rem;
    }
    .actions-cell {
      position: relative;
      width: 60px;
    }
    .action-menu-container {
      position: relative;
      display: inline-block;
    }
    .action-menu-btn {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      color: #666;
      line-height: 1;
      transition: all 0.2s;
      border-radius: 4px;
    }
    .action-menu-btn:hover {
      background: #f0f0f0;
      color: #333;
    }
    .action-menu {
      position: absolute;
      right: 0;
      top: 100%;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 200px;
      z-index: 100;
      margin-top: 0.25rem;
      overflow: hidden;
    }
    .menu-item {
      display: block;
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: white;
      text-align: left;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.2s;
      color: #333;
    }
    .menu-item:hover {
      background: #f5f5f5;
    }
    .menu-item-danger {
      color: #c62828;
    }
    .menu-item-danger:hover {
      background: #ffebee;
    }
  `]
})
export class MetersComponent implements OnInit {
  meters: any[] = [];
  searchTerm = '';
  statusFilter = '';
  typeFilter = '';
  showModal = false;
  isEditMode = false;
  currentMeter: any = this.getEmptyMeter();
  currentYear = new Date().getFullYear();
  activeMenuId: string | null = null;

  // Reading modal
  showReadingModal = false;
  showReadingsListModal = false;
  selectedMeter: any = null;
  currentReading: any = {
    readingValue: null,
    readingDate: new Date().toISOString().split('T')[0],
    readingType: 'regular',
    notes: ''
  };
  meterReadings: any[] = [];

  constructor(
    private meterService: MeterService,
    private meterReadingService: MeterReadingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Prüfe ob eine ID in der Route vorhanden ist
    this.route.params.subscribe(params => {
      const meterId = params['id'];
      if (meterId) {
        // Zeige Zähler bearbeiten Modal
        this.loadMeterById(meterId);
      } else {
        this.loadMeters();
      }
    });
  }

  loadMeterById(id: string): void {
    // Lade zuerst die Zählerliste
    this.loadMeters();

    // Dann lade den spezifischen Zähler und öffne das Modal
    this.meterService.getMeter(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.currentMeter = response.data;
          this.isEditMode = true;
          this.showModal = true;
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden des Zählers:', error);
        alert('Zähler konnte nicht geladen werden');
      }
    });
  }

  getEmptyMeter(): any {
    return {
      meterNumber: '',
      type: '',
      manufacturer: '',
      yearBuilt: null,
      location: {
        street: '',
        zip: '',
        city: ''
      }
    };
  }

  get filteredMeters(): any[] {
    let filtered = this.meters;

    if (this.searchTerm) {
      filtered = filtered.filter(meter =>
        meter.meterNumber?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(meter => {
        const isFree = !meter.currentCustomerId;
        return this.statusFilter === 'free' ? isFree : !isFree;
      });
    }

    if (this.typeFilter) {
      filtered = filtered.filter(meter => meter.type === this.typeFilter);
    }

    return filtered;
  }

  loadMeters(): void {
    this.meterService.getMeters({}).subscribe({
      next: (response) => {
        if (response.success) this.meters = response.data;
      }
    });
  }

  onSearchChange(): void {
    setTimeout(() => this.loadMeters(), 300);
  }

  showCreateModal(): void {
    this.isEditMode = false;
    this.currentMeter = this.getEmptyMeter();
    this.showModal = true;
  }

  editMeter(meter: any): void {
    this.isEditMode = true;
    this.currentMeter = { ...meter, location: { ...meter.location } };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentMeter = this.getEmptyMeter();
  }

  saveMeter(): void {
    if (this.isEditMode) {
      this.meterService.updateMeter(this.currentMeter._id, this.currentMeter).subscribe({
        next: (response) => {
          if (response.success) {
            this.closeModal();
            this.loadMeters();
          }
        },
        error: (error) => {
          alert('Fehler beim Aktualisieren des Zählers: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    } else {
      this.meterService.createMeter(this.currentMeter).subscribe({
        next: (response) => {
          if (response.success) {
            this.closeModal();
            this.loadMeters();
          }
        },
        error: (error) => {
          alert('Fehler beim Erstellen des Zählers: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    }
  }

  getTypeLabel(type: string): string {
    const labels: any = { electricity: 'Strom', gas: 'Gas', water: 'Wasser' };
    return labels[type] || type;
  }

  viewHistory(meterId: string): void {
    alert('Historie-Ansicht für Zähler: ' + meterId);
  }

  showAddReadingModal(meter: any): void {
    this.selectedMeter = meter;
    this.currentReading = {
      readingValue: null,
      readingDate: new Date().toISOString().split('T')[0],
      readingType: 'regular',
      notes: ''
    };
    this.showReadingModal = true;
  }

  closeReadingModal(): void {
    this.showReadingModal = false;
    this.selectedMeter = null;
  }

  saveReading(): void {
    if (!this.selectedMeter || !this.currentReading.readingValue) {
      alert('Bitte geben Sie einen Zählerstand ein');
      return;
    }

    this.meterReadingService.createReading(this.selectedMeter._id, this.currentReading).subscribe({
      next: (response) => {
        if (response.success) {
          this.closeReadingModal();
          this.loadMeters(); // Reload to get updated reading
          alert('Ablesung erfolgreich gespeichert');
        }
      },
      error: (error) => {
        alert('Fehler beim Speichern der Ablesung: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  viewReadings(meter: any): void {
    this.selectedMeter = meter;
    this.meterReadingService.getMeterReadings(meter._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.meterReadings = response.data;
          this.showReadingsListModal = true;
        }
      },
      error: (error) => {
        alert('Fehler beim Laden der Ablesungen: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  closeReadingsListModal(): void {
    this.showReadingsListModal = false;
    this.meterReadings = [];
    this.selectedMeter = null;
  }

  deleteReading(readingId: string): void {
    if (!confirm('Möchten Sie diese Ablesung wirklich löschen?')) {
      return;
    }

    this.meterReadingService.deleteReading(this.selectedMeter._id, readingId).subscribe({
      next: (response) => {
        if (response.success) {
          this.viewReadings(this.selectedMeter); // Reload readings
          this.loadMeters(); // Reload meters to update current reading
        }
      },
      error: (error) => {
        alert('Fehler beim Löschen der Ablesung: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  getReadingTypeLabel(type: string): string {
    const labels: any = {
      initial: 'Erstablesung',
      regular: 'Regulär',
      final: 'Schlussablesung',
      special: 'Sonderablesung'
    };
    return labels[type] || type;
  }

  toggleActionMenu(id: string): void {
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  closeActionMenu(): void {
    this.activeMenuId = null;
  }

  deleteMeter(id: string): void {
    if (!confirm('Möchten Sie diesen Zähler wirklich löschen?')) {
      return;
    }

    this.meterService.deleteMeter(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadMeters();
          alert('Zähler erfolgreich gelöscht');
        }
      },
      error: (error) => {
        alert('Fehler beim Löschen des Zählers: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
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
