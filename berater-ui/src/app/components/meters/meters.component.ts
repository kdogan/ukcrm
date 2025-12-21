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
import { TableContainerComponent } from '../shared/tablecontainer.component';

// CONTRACTS COMPONENT
// @Component({
//   selector: 'app-contracts',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   styleUrls: ['./meters.component.scss'],
//   templateUrl: './meters.component.html',

// })
// export class ContractsComponent implements OnInit {
//   contracts: any[] = [];
//   customers: any[] = [];
//   suppliers: any[] = [];
//   freeMeters: any[] = [];
//   statusFilter = '';
//   daysFilter = '';
//   showModal = false;
//   isEditMode = false;
//   currentContract: any = this.getEmptyContract();

//   constructor(
//     private contractService: ContractService,
//     private customerService: CustomerService,
//     private supplierService: SupplierService,
//     private meterService: MeterService,
//     private route: ActivatedRoute
//   ) {}

//   ngOnInit(): void {
//     // Lade immer Kunden, Lieferanten und freie Zähler
//     this.loadCustomers();
//     this.loadSuppliers();
//     this.loadFreeMeters();

//     // Prüfe ob eine ID in der Route vorhanden ist
//     this.route.params.subscribe(params => {
//       const contractId = params['id'];
//       console.log('ContractsComponent - Route params:', params);
//       console.log('ContractsComponent - Contract ID:', contractId);

//       if (contractId) {
//         // Zeige Vertrag bearbeiten Modal
//         console.log('ContractsComponent - Loading contract by ID:', contractId);
//         this.loadContractById(contractId);
//       } else {
//         console.log('ContractsComponent - Loading all contracts');
//         this.loadContracts();
//       }
//     });
//   }

//   loadContractById(id: string): void {
//     console.log('loadContractById called with ID:', id);
//     // Lade zuerst die Vertragsliste
//     this.loadContracts();

//     // Dann lade den spezifischen Vertrag und öffne das Modal
//     this.contractService.getContract(id).subscribe({
//       next: (response) => {
//         console.log('Contract loaded from backend:', response);
//         if (response.success) {
//           const contract = response.data;
//           this.currentContract = {
//             _id: contract._id,
//             contractNumber: contract.contractNumber,
//             customerId: contract.customerId?._id || contract.customerId,
//             meterId: contract.meterId?._id || contract.meterId,
//             supplierId: contract.supplierId?._id || contract.supplierId,
//             startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
//             durationMonths: contract.durationMonths,
//             status: contract.status,
//             notes: contract.notes || ''
//           };
//           console.log('Setting currentContract:', this.currentContract);
//           console.log('Opening modal - isEditMode:', true, 'showModal:', true);
//           this.isEditMode = true;
//           this.showModal = true;
//         }
//       },
//       error: (error) => {
//         console.error('Fehler beim Laden des Vertrags:', error);
//         alert('Vertrag konnte nicht geladen werden: ' + (error.error?.message || error.message));
//       }
//     });
//   }

//   getEmptyContract(): any {
//     return {
//       contractNumber: '',
//       customerId: '',
//       meterId: '',
//       supplierId: '',
//       startDate: '',
//       durationMonths: 24,
//       status: 'active',
//       notes: ''
//     };
//   }

//   loadContracts(): void {
//     const params: any = {};
//     if (this.statusFilter) params.status = this.statusFilter;
//     if (this.daysFilter) params.daysRemaining = this.daysFilter;

//     this.contractService.getContracts(params).subscribe({
//       next: (response) => {
//         if (response.success) this.contracts = response.data;
//       }
//     });
//   }

//   loadCustomers(): void {
//     this.customerService.getCustomers({ isActive: true, limit: 1000 }).subscribe({
//       next: (response) => {
//         if (response.success) this.customers = response.data;
//       }
//     });
//   }

//   loadSuppliers(): void {
//     this.supplierService.getSuppliers({ isActive: true, limit: 1000 }).subscribe({
//       next: (response) => {
//         if (response.success) this.suppliers = response.data;
//       }
//     });
//   }

//   loadFreeMeters(): void {
//     this.meterService.getMeters({ status: 'free', limit: 1000 }).subscribe({
//       next: (response) => {
//         if (response.success) this.freeMeters = response.data;
//       }
//     });
//   }

//   showCreateModal(): void {
//     this.isEditMode = false;
//     this.currentContract = this.getEmptyContract();
//     this.showModal = true;
//   }

//   editContract(contract: any): void {
//     this.isEditMode = true;
//     this.currentContract = {
//       ...contract,
//       customerId: contract.customerId?._id || contract.customerId,
//       meterId: contract.meterId?._id || contract.meterId,
//       supplierId: contract.supplierId?._id || contract.supplierId,
//       startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : ''
//     };
//     this.showModal = true;
//   }

//   closeModal(): void {
//     this.showModal = false;
//     this.currentContract = this.getEmptyContract();
//   }

//   saveContract(): void {
//     if (this.isEditMode) {
//       this.contractService.updateContract(this.currentContract._id, this.currentContract).subscribe({
//         next: (response) => {
//           if (response.success) {
//             this.closeModal();
//             this.loadContracts();
//           }
//         },
//         error: (error) => {
//           alert('Fehler beim Aktualisieren des Vertrags: ' + (error.error?.message || 'Unbekannter Fehler'));
//         }
//       });
//     } else {
//       this.contractService.createContract(this.currentContract).subscribe({
//         next: (response) => {
//           if (response.success) {
//             this.closeModal();
//             this.loadContracts();
//             this.loadFreeMeters();
//           }
//         },
//         error: (error) => {
//           alert('Fehler beim Erstellen des Vertrags: ' + (error.error?.message || 'Unbekannter Fehler'));
//         }
//       });
//     }
//   }

//   getStatusLabel(status: string): string {
//     const labels: any = {
//       active: 'Aktiv',
//       ended: 'Beendet',
//       archived: 'Archiviert'
//     };
//     return labels[status] || status;
//   }

//   getTypeLabel(type: string): string {
//     const labels: any = { electricity: 'Strom', gas: 'Gas', water: 'Wasser' };
//     return labels[type] || type;
//   }
// }

// METERS COMPONENT
@Component({
  selector: 'app-meters',
  standalone: true,
  imports: [CommonModule, FormsModule, TableContainerComponent],
  styleUrls: ['./meters.component.scss'],
  templateUrl: './meters.component.html',
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

// // REMINDERS COMPONENT
// @Component({
//   selector: 'app-reminders',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="page-container">
//       <h1>Erinnerungen</h1>
//       <div class="reminders-grid">
//         <div *ngFor="let reminder of reminders" class="reminder-card" [class.high-priority]="isPriority(reminder)">
//           <div class="reminder-header">
//             <span class="reminder-type">{{ getTypeLabel(reminder.reminderType) }}</span>
//             <span class="reminder-date">{{ reminder.dueDate | date:'dd.MM.yyyy' }}</span>
//           </div>
//           <div class="reminder-body">
//             <h3>{{ reminder.contractId?.customerId?.firstName }} {{ reminder.contractId?.customerId?.lastName }}</h3>
//             <p>Anbieter: {{ reminder.contractId?.supplierId?.name }}</p>
//             <p>Vertrag: {{ reminder.contractId?.contractNumber }}</p>
//           </div>
//           <button class="btn-done" (click)="markDone(reminder._id)">Als erledigt markieren</button>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .page-container { padding: 2rem; }
//     h1 { font-size: 2rem; margin-bottom: 1.5rem; }
//     .reminders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
//     .reminder-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #667eea; }
//     .reminder-card.high-priority { border-left-color: #e74c3c; }
//     .reminder-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
//     .reminder-type { font-weight: 600; color: #667eea; }
//     .reminder-date { color: #888; font-size: 0.9rem; }
//     .reminder-body h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
//     .reminder-body p { margin: 0.25rem 0; color: #666; font-size: 0.9rem; }
//     .btn-done { margin-top: 1rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%; }
//   `]
// })
// export class RemindersComponent implements OnInit {
//   reminders: any[] = [];

//   constructor(private reminderService: ReminderService) {}

//   ngOnInit(): void {
//     this.loadReminders();
//   }

//   loadReminders(): void {
//     this.reminderService.getReminders('open').subscribe({
//       next: (response) => {
//         if (response.success) this.reminders = response.data;
//       }
//     });
//   }

//   getTypeLabel(type: string): string {
//     const labels: any = { '90days': '90 Tage', '60days': '60 Tage', '30days': '30 Tage' };
//     return labels[type] || type;
//   }

//   isPriority(reminder: any): boolean {
//     const days = Math.ceil((new Date(reminder.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
//     return days <= 30;
//   }

//   markDone(id: string): void {
//     this.reminderService.markAsDone(id).subscribe({
//       next: () => this.loadReminders()
//     });
//   }
// }
