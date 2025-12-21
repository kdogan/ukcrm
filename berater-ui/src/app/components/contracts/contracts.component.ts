import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { CustomerService } from '../../services/customer.service';
import { SupplierService } from '../../services/supplier.service';
import { MeterService } from '../../services/meter.service';
import { ReminderService } from '../../services/reminder.service';
import { PackageService } from '../../services/package.service';

// CONTRACTS COMPONENT
@Component({
  selector: 'app-contracts',
  styleUrls: ['./contracts.component.scss'],
  templateUrl: './contracts.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  activeMenuId: string | null = null;
  showCustomerDetailsModal = false;
  showSupplierDetailsModal = false;
  showMeterDetailsModal = false;
  selectedCustomerDetails: any = null;
  selectedSupplierDetails: any = null;
  selectedMeterDetails: any = null;

  constructor(
    private contractService: ContractService,
    private customerService: CustomerService,
    private supplierService: SupplierService,
    private meterService: MeterService,
    private route: ActivatedRoute,
    private router: Router,
    private packageService: PackageService
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

          // Setze ausgewählten Kunden und Zähler für die Anzeige
          if (contract.customerId) {
            this.selectedCustomer = contract.customerId;
            this.customerSearch = typeof contract.customerId === 'object'
              ? `${contract.customerId.firstName} ${contract.customerId.lastName}`
              : '';
          }

          if (contract.meterId) {
            this.selectedMeter = contract.meterId;
            this.meterSearch = typeof contract.meterId === 'object'
              ? contract.meterId.meterNumber
              : '';
          }

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
    // Prüfe zuerst die Paket-Limits
    this.packageService.getUserLimits().subscribe({
      next: (response) => {
        const userLimits = response.data;

        // Prüfe ob das Vertragslimit erreicht ist
        if (userLimits.limits.isAtContractLimit) {
          const confirmUpgrade = confirm(
            `Sie haben das Vertragslimit Ihres ${userLimits.package.displayName}-Pakets erreicht!\n\n` +
            `Aktuell: ${userLimits.usage.contracts} / ${userLimits.limits.maxContracts} Verträge\n\n` +
            `Um weitere Verträge anzulegen, müssen Sie Ihr Paket upgraden.\n\n` +
            `Möchten Sie jetzt zur Paket-Verwaltung wechseln?`
          );

          if (confirmUpgrade) {
            this.router.navigate(['/settings']);
          }
          return;
        }

        // Wenn das Limit nicht erreicht ist, öffne das Formular
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
      },
      error: (err) => {
        console.error('Error checking package limits:', err);
        // Bei Fehler trotzdem Formular öffnen (Backend prüft auch)
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
    });
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
          const errorData = error.error;
          if (errorData?.limitReached && errorData?.upgradeRequired) {
            const message = `${errorData.message}\n\nSie haben derzeit ${errorData.currentCount} von ${errorData.maxAllowed} Verträgen.\n\nMöchten Sie Ihr Paket jetzt upgraden?`;
            if (confirm(message)) {
              this.router.navigate(['/packages']);
            }
          } else {
            alert('Fehler beim Erstellen des Vertrags: ' + (errorData?.message || 'Unbekannter Fehler'));
          }
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

  toggleActionMenu(id: string): void {
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  closeActionMenu(): void {
    this.activeMenuId = null;
  }

  deleteContract(id: string): void {
    if (confirm('Vertrag wirklich löschen?')) {
      this.contractService.deleteContract(id).subscribe({
        next: () => {
          this.loadContracts();
          this.loadFreeMeters();
        },
        error: (error: any) => {
          alert('Fehler beim Löschen des Vertrags: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    }
  }

  showCustomerDetails(customer: any): void {
    if (customer._id) {
      this.customerService.getCustomer(customer._id).subscribe({
        next: (response) => {
          if (response.success) {
            this.selectedCustomerDetails = response.data;
            this.showCustomerDetailsModal = true;
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der Kundendetails:', error);
          alert('Kundendetails konnten nicht geladen werden');
        }
      });
    } else {
      this.selectedCustomerDetails = customer;
      this.showCustomerDetailsModal = true;
    }
  }

  closeCustomerDetails(): void {
    this.showCustomerDetailsModal = false;
    this.selectedCustomerDetails = null;
  }

  showSupplierDetails(supplier: any): void {
    if (supplier._id) {
      this.supplierService.getSupplier(supplier._id).subscribe({
        next: (response) => {
          if (response.success) {
            this.selectedSupplierDetails = response.data;
            this.showSupplierDetailsModal = true;
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der Anbieterdetails:', error);
          alert('Anbieterdetails konnten nicht geladen werden');
        }
      });
    } else {
      this.selectedSupplierDetails = supplier;
      this.showSupplierDetailsModal = true;
    }
  }

  closeSupplierDetails(): void {
    this.showSupplierDetailsModal = false;
    this.selectedSupplierDetails = null;
  }

  showMeterDetails(meter: any): void {
    if (meter._id) {
      this.meterService.getMeter(meter._id).subscribe({
        next: (response) => {
          if (response.success) {
            this.selectedMeterDetails = response.data;
            this.showMeterDetailsModal = true;
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der Zählerdetails:', error);
          alert('Zählerdetails konnten nicht geladen werden');
        }
      });
    } else {
      this.selectedMeterDetails = meter;
      this.showMeterDetailsModal = true;
    }
  }

  closeMeterDetails(): void {
    this.showMeterDetailsModal = false;
    this.selectedMeterDetails = null;
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
