import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { CustomerService } from '../../services/customer.service';
import { SupplierService } from '../../services/supplier.service';
import { MeterService } from '../../services/meter.service';
import { PackageService } from '../../services/package.service';
import { PackageFeatureService } from '../../services/package-feature.service';
import { ViewportService, ViewportType } from 'src/app/services/viewport.service';
import { ContractsMobileComponent } from './mobile/contracts-mobile/contracts-mobile.component';
import { ContractsDesktopComponent } from './desktop/contracts-desktop/contracts-desktop.component';
import { OverlayModalComponent } from "../shared/overlay-modal.component";
import { CustomerDetailComponent, CustomerContract } from "../shared/customer-detail.component";
import { ContractState, stateToLabel } from 'src/app/models/contract.model';
import { Util } from '../util/util';
import { Address, MeterType, meterTypes } from 'src/app/models/meter.model';
import { MeterCreateComponent } from '../shared/meter-create.component';

// CONTRACTS COMPONENT
@Component({
    selector: 'app-contracts',
    styleUrls: ['./contracts.component.scss'],
    templateUrl: './contracts.component.html',
    standalone:true,
    imports: [CommonModule,
        FormsModule,
        ContractsDesktopComponent,
        ContractsMobileComponent,
        OverlayModalComponent,
        MeterCreateComponent,
        CustomerDetailComponent
      ]
})
export class ContractsComponent implements OnInit {

  contracts: any[] = [];
  filteredContracts: any[] = [];
  customers: any[] = [];
  suppliers: any[] = [];
  freeMeters: any[] = [];
  filteredCustomers: any[] = [];
  filteredFreeMeters: any[] = [];
  statusFilter = '';
  daysFilter = '';
  contractSearchTerm = '';
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
  showContractDetailsModal = false;
  selectedCustomerDetails: any = null;
  selectedSupplierDetails: any = null;
  selectedMeterDetails: any = null;
  selectedContractDetails: any = null;
  customerContracts: any[] = []; // Verträge des ausgewählten Kunden
  showImageViewer = false;
  viewingImage: any = null;
  imageViewerUrl: string = '';
  viewport: ViewportType = ViewportType.Desktop;

  // Customer/Meter creation modals
  showCustomerCreationModal = false;
  showMeterCreationModal = false;
  newCustomer: any = this.getEmptyCustomer();
  newMeter: any = this.getEmptyMeter();
  meterTypes = meterTypes;

  contractState = [
    {
      key: ContractState.ACTIVE,
      value: stateToLabel[ContractState.ACTIVE]
    },
    {
      key: ContractState.ARCHIVED,
      value: stateToLabel[ContractState.ARCHIVED]
    },
    {
      key: ContractState.DRAFT,
      value: stateToLabel[ContractState.DRAFT]
    },
    {
      key: ContractState.ENDET,
      value: stateToLabel[ContractState.ENDET]
    }
  ]

  constructor(
    private contractService: ContractService,
    private customerService: CustomerService,
    private supplierService: SupplierService,
    private meterService: MeterService,
    private route: ActivatedRoute,
    private router: Router,
    private packageService: PackageService,
    public viewportService: ViewportService,
    public packageFeatureService: PackageFeatureService
  ) { }

  ngOnInit(): void {

    // Lade immer Kunden, Lieferanten und freie Zähler
    this.loadCustomers();
    this.loadSuppliers();
    this.loadFreeMeters();

    // Reaktiv auf Route-Parameter-Änderungen reagieren
    this.route.params.subscribe(params => {
      const contractId = params['id'];

      // Schließe zuerst das Modal, falls es offen ist
      if (this.showModal && !contractId) {
        this.showModal = false;
        this.currentContract = this.getEmptyContract();
        this.selectedCustomer = null;
        this.selectedMeter = null;
        this.customerSearch = '';
        this.meterSearch = '';
      }

      if (contractId) {
        // Zeige Vertrag bearbeiten Modal
        this.loadContractById(contractId);
      } else {
        // Lade normale Vertragsliste
        this.loadContracts();
      }
    });
  }

  get isMobile() {
    return this.viewport === ViewportType.Mobile;
  }
  onStatusChange($event: string) {
    this.statusFilter = $event;
    this.loadContracts();
  }
  onDaysChange($event: string) {
    this.daysFilter = $event;
    this.loadContracts();
  }

  loadContractById(id: string): void {
    // Lade zuerst die Vertragsliste
    this.loadContracts();

    // Dann lade den spezifischen Vertrag und öffne das Modal
    this.contractService.getContract(id).subscribe({
      next: (response) => {
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
      notes: '',
      supplierContractNumber:''
    };
  }

  loadContracts(): void {
    const params: any = {};
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.daysFilter) params.daysRemaining = this.daysFilter;

    this.contractService.getContracts(params).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.contracts = response.data;
          this.applySearchFilter();
        }
      }
    });
  }

  onContractSearchChange(searchTerm: string): void {
    this.contractSearchTerm = searchTerm;
    this.applySearchFilter();
  }

  applySearchFilter(): void {
    if (!this.contractSearchTerm || this.contractSearchTerm.trim() === '') {
      this.filteredContracts = this.contracts;
      return;
    }

    const searchLower = this.contractSearchTerm.toLowerCase().trim();

    this.filteredContracts = this.contracts.filter(contract => {
      // Suche in Vertragsnummer
      if (contract.contractNumber?.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Suche in Kunde (firstName, lastName, customerNumber)
      if (contract.customerId) {
        const customer = contract.customerId;
        if (customer.firstName?.toLowerCase().includes(searchLower) ||
            customer.lastName?.toLowerCase().includes(searchLower) ||
            customer.customerNumber?.toLowerCase().includes(searchLower)) {
          return true;
        }
      }

      // Suche in Zählernummer
      if (contract.meterId?.meterNumber?.toLowerCase().includes(searchLower)) {
        return true;
      }

      return false;
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
          // Explizit neue Arrays erstellen für Change Detection
          this.freeMeters = [...response.data];
          this.filteredFreeMeters = [...response.data];

          // Wenn ein Zähler ausgewählt ist, aktualisiere seine Referenz
          if (this.selectedMeter) {
            const updatedMeter = this.freeMeters.find(m => m._id === this.selectedMeter._id);
            if (updatedMeter) {
              this.selectedMeter = updatedMeter;
            }
          }
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
    // Wenn wir eine ID in der Route haben, navigiere zurück zur Übersicht
    // Das route.params subscribe in ngOnInit wird dann automatisch reagieren
    if (this.route.snapshot.params['id']) {
      this.router.navigate(['/contracts']);
    } else {
      // Wenn keine ID in der Route, schließe einfach das Modal
      this.showModal = false;
      this.currentContract = this.getEmptyContract();
      this.selectedCustomer = null;
      this.selectedMeter = null;
      this.customerSearch = '';
      this.meterSearch = '';
      this.pendingFiles = []; // Pending Files zurücksetzen
      this.isSaving = false; // Loading state zurücksetzen
    }
  }

  saveContract(): void {
    // Verhindere mehrfaches Klicken
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

    if (this.isEditMode) {
      this.contractService.updateContract(this.currentContract._id, this.currentContract).subscribe({
        next: (response) => {
          if (response.success) {
            this.isSaving = false;
            this.closeModal();
            this.loadContracts();
            this.loadFreeMeters(); // Zählerliste auch aktualisieren
          }
        },
        error: (error) => {
          this.isSaving = false;
          alert('Fehler beim Aktualisieren des Vertrags: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    } else {
      this.contractService.createContract(this.currentContract).subscribe({
        next: (response) => {
          if (response.success) {
            const newContractId = response.data._id;

            // Wenn es pending Files gibt, diese jetzt hochladen
            if (this.pendingFiles.length > 0) {
              this.uploadPendingFiles(newContractId);
            } else {
              this.isSaving = false;
              this.closeModal();
              this.loadContracts();
              this.loadFreeMeters();
            }
          }
        },
        error: (error) => {
          this.isSaving = false;
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

  uploadPendingFiles(contractId: string): void {
    let uploadedCount = 0;
    const totalFiles = this.pendingFiles.length;

    this.pendingFiles.forEach(file => {
      this.contractService.uploadAttachment(contractId, file).subscribe({
        next: (response) => {
          uploadedCount++;
          if (uploadedCount === totalFiles) {
            // Alle Dateien hochgeladen
            this.pendingFiles = [];
            this.isSaving = false;
            this.closeModal();
            this.loadContracts();
            this.loadFreeMeters();
          }
        },
        error: (error) => {
          uploadedCount++;
          console.error('Fehler beim Hochladen von', file.name, error);
          if (uploadedCount === totalFiles) {
            // Auch bei Fehlern weitermachen
            this.pendingFiles = [];
            this.isSaving = false;
            this.closeModal();
            this.loadContracts();
            this.loadFreeMeters();
            alert('Einige Dateien konnten nicht hochgeladen werden.');
          }
        }
      });
    });
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
    return Util.getMeterTypeLabel(type)
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

  showCustomerDetails(id: string): void {
    if (id) {
      this.customerService.getCustomer(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.selectedCustomerDetails = response.data;
            this.loadCustomerContracts(id);
            this.showCustomerDetailsModal = true;
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der Kundendetails:', error);
          alert('Kundendetails konnten nicht geladen werden');
        }
      });
    } else {
      this.selectedCustomerDetails = null;
      this.customerContracts = [];
      this.showCustomerDetailsModal = true;
    }
  }

  loadCustomerContracts(customerId: string): void {
    this.customerContracts = this.contracts.filter(
      (contract: any) => contract.customerId?._id === customerId || contract.customerId === customerId
    );
  }

  closeCustomerDetails(): void {
    this.showCustomerDetailsModal = false;
    this.selectedCustomerDetails = null;
    this.customerContracts = [];
  }

  onContractClick(contract: CustomerContract): void {
    this.closeCustomerDetails();
    // Finde den vollständigen Vertrag aus der Liste
    const fullContract = this.contracts.find(c => c._id === contract._id);
    if (fullContract) {
      this.editContract(fullContract);
    }
  }

  showSupplierDetails(id: string): void {
    if (id) {
      this.supplierService.getSupplier(id).subscribe({
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
      this.selectedSupplierDetails = null;
      this.showSupplierDetailsModal = true;
    }
  }

  closeSupplierDetails(): void {
    this.showSupplierDetailsModal = false;
    this.selectedSupplierDetails = null;
  }

  showMeterDetails(id: string): void {
    if (id) {
      this.meterService.getMeter(id).subscribe({
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
      this.selectedMeterDetails = null;
      this.showMeterDetailsModal = true;
    }
  }

  closeMeterDetails(): void {
    this.showMeterDetailsModal = false;
    this.selectedMeterDetails = null;
  }

  showContractDetails(contract: any): void {
    this.selectedContractDetails = contract;
    this.showContractDetailsModal = true;
  }

  closeContractDetails(): void {
    this.showContractDetailsModal = false;
    this.selectedContractDetails = null;
  }

  // File Upload Methods
  uploadingFile = false;
  pendingFiles: File[] = []; // Dateien die noch nicht hochgeladen wurden (nur beim Erstellen)

  // Loading state for contract creation/update
  isSaving = false;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Dateigrößenprüfung (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Datei ist zu groß! Maximale Größe: 10MB');
      return;
    }

    // Wenn Vertrag schon existiert (Edit-Modus), direkt hochladen
    if (this.isEditMode && this.currentContract._id) {
      this.uploadingFile = true;
      this.contractService.uploadAttachment(this.currentContract._id, file).subscribe({
        next: (response) => {
          if (response.success) {
            // Attachment zur Liste hinzufügen
            if (!this.currentContract.attachments) {
              this.currentContract.attachments = [];
            }
            this.currentContract.attachments.push(response.data);
            this.uploadingFile = false;
            // Input zurücksetzen
            event.target.value = '';
          }
        },
        error: (error) => {
          this.uploadingFile = false;
          alert('Fehler beim Hochladen: ' + (error.error?.message || 'Unbekannter Fehler'));
          event.target.value = '';
        }
      });
    } else {
      // Im Create-Modus: Datei nur zwischenspeichern
      this.pendingFiles.push(file);
      // Input zurücksetzen
      event.target.value = '';
    }
  }

  downloadAttachment(attachment: any): void {
    this.contractService.downloadAttachment(this.currentContract._id, attachment._id).subscribe({
      next: (blob) => {
        // Blob als Download auslösen
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.originalName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        alert('Fehler beim Herunterladen: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  deleteAttachment(attachment: any): void {
    const fileName = attachment.originalName || attachment.name;
    if (confirm(`Datei "${fileName}" wirklich löschen?`)) {
      // Wenn attachment eine File-Instanz ist (pending), nur aus pendingFiles entfernen
      if (attachment instanceof File) {
        const index = this.pendingFiles.indexOf(attachment);
        if (index > -1) {
          this.pendingFiles.splice(index, 1);
        }
      } else {
        // Ansonsten ist es ein bereits hochgeladenes Attachment - Backend-Call
        this.contractService.deleteAttachment(this.currentContract._id, attachment._id).subscribe({
          next: (response) => {
            if (response.success) {
              // Attachment aus Liste entfernen
              const index = this.currentContract.attachments.findIndex((a: any) => a._id === attachment._id);
              if (index > -1) {
                this.currentContract.attachments.splice(index, 1);
              }
            }
          },
          error: (error) => {
            alert('Fehler beim Löschen: ' + (error.error?.message || 'Unbekannter Fehler'));
          }
        });
      }
    }
  }

  removePendingFile(file: File): void {
    const index = this.pendingFiles.indexOf(file);
    if (index > -1) {
      this.pendingFiles.splice(index, 1);
    }
  }

  getFileIcon(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'fas fa-file-image';
    if (mimetype === 'application/pdf') return 'fas fa-file-pdf';
    if (mimetype.includes('word')) return 'fas fa-file-word';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'fas fa-file-excel';
    if (mimetype === 'text/plain') return 'fas fa-file-alt';
    if (mimetype === 'text/csv') return 'fas fa-file-csv';
    return 'fas fa-file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  viewImage(attachment: any): void {
    this.viewingImage = attachment;
    this.showImageViewer = true;

    // Bild vom Server laden
    this.contractService.downloadAttachment(this.currentContract._id, attachment._id).subscribe({
      next: (blob) => {
        // Erstelle eine URL für das Blob
        this.imageViewerUrl = window.URL.createObjectURL(blob);
      },
      error: (error) => {
        console.error('Fehler beim Laden des Bildes:', error);
        alert('Fehler beim Laden des Bildes');
        this.closeImageViewer();
      }
    });
  }

  closeImageViewer(): void {
    // Räume die Blob-URL auf
    if (this.imageViewerUrl) {
      window.URL.revokeObjectURL(this.imageViewerUrl);
      this.imageViewerUrl = '';
    }
    this.showImageViewer = false;
    this.viewingImage = null;
  }

  // Customer/Meter Creation Methods
  getEmptyCustomer(): any {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        zip: '',
        city: ''
      },
      notes: ''
    };
  }

  getEmptyMeter(): any {
    return {
      meterNumber: '',
      type: '',
      maloId: '',
      manufacturer: '',
      yearBuilt: null,
      location: {
        street: '',
        zip: '',
        city: ''
      }
    };
  }

  openCustomerCreationModal(): void {
    this.newCustomer = this.getEmptyCustomer();
    this.showCustomerCreationModal = true;
    this.showCustomerDropdown = false;
  }

  openMeterCreationModal(): void {
    this.newMeter = this.getEmptyMeter();
    this.showMeterCreationModal = true;
    this.showMeterDropdown = false;
  }

  closeCustomerCreationModal(): void {
    this.showCustomerCreationModal = false;
    this.newCustomer = this.getEmptyCustomer();
  }

  closeMeterCreationModal(): void {
    this.showMeterCreationModal = false;
    this.newMeter = this.getEmptyMeter();
  }

  saveNewCustomer(): void {
    this.customerService.createCustomer(this.newCustomer).subscribe({
      next: (response) => {
        if (response.success) {
          const createdCustomer = response.data;

          // Füge den neuen Kunden zur Liste hinzu
          this.customers.push(createdCustomer);
          this.filteredCustomers = this.customers;

          // Wähle den neu erstellten Kunden automatisch aus
          this.selectCustomer(createdCustomer);

          // Schließe das Modal
          this.closeCustomerCreationModal();

          alert('Kunde erfolgreich erstellt!');
        }
      },
      error: (error) => {
        alert('Fehler beim Erstellen des Kunden: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  saveNewMeter(): void {
    this.meterService.createMeter(this.newMeter).subscribe({
      next: (response) => {
        if (response.success) {
          const createdMeter = response.data;

          // Füge den neuen Zähler zur Liste hinzu
          this.freeMeters.push(createdMeter);
          this.filteredFreeMeters = this.freeMeters;

          // Wähle den neu erstellten Zähler automatisch aus
          this.selectMeter(createdMeter);

          // Schließe das Modal
          this.closeMeterCreationModal();

          alert('Zähler erfolgreich erstellt!');
        }
      },
      error: (error) => {
        alert('Fehler beim Erstellen des Zählers: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }


  formatAddress(address: Address): string {
    let adresse = '';
    if(address.street){
      adresse = adresse +address.street;
    }
    if(address.zip){
      adresse = adresse +', '+address.zip;
    }
    if(address.city){
      adresse = adresse +' '+ address.city;
    }
    if(address.country){
      adresse = adresse +', '+ address.country;
    }
  return adresse;
}
}