import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { CustomerService } from '../../services/customer.service';
import { SupplierService } from '../../services/supplier.service';
import { MeterService } from '../../services/meter.service';
import { MeterReadingService } from '../../services/meter-reading.service';
import { PackageService } from '../../services/package.service';
import { PackageFeatureService } from '../../services/package-feature.service';
import { ViewportService, ViewportType } from 'src/app/services/viewport.service';
import { ContractsMobileComponent } from './mobile/contracts-mobile/contracts-mobile.component';
import { ContractsDesktopComponent } from './desktop/contracts-desktop/contracts-desktop.component';
import { OverlayModalComponent } from "../shared/overlay-modal.component";
import { CustomerDetailComponent, CustomerContract } from "../shared/customer-detail.component";
import { MeterDetailComponent } from "../shared/meter-detail.component";
import { CustomerFormComponent, CustomerFormData } from '../shared/customer-form.component';
import { ContractState, stateToLabel } from 'src/app/models/contract.model';
import { Util } from '../util/util';
import { Address, MeterType, meterTypes } from 'src/app/models/meter.model';
import { MeterCreateComponent } from '../shared/meter-create.component';
import { TranslateModule } from '@ngx-translate/core';
import { AddressAutocompleteComponent, AddressData } from '../shared/address-autocomplete.component';
import { CustomerSearchComponent } from '../shared/customer-search.component';
import { MeterSearchComponent } from '../shared/meter-search.component';
import { SupplierSearchComponent } from '../shared/supplier-search.component';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { ExcelExportService } from '../../services/excel-export.service';

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
        CustomerDetailComponent,
        MeterDetailComponent,
        CustomerFormComponent,
        TranslateModule,
        AddressAutocompleteComponent,
        CustomerSearchComponent,
        MeterSearchComponent,
        SupplierSearchComponent
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
  supplierSearch = '';
  showCustomerDropdown = false;
  showMeterDropdown = false;
  showSupplierDropdown = false;
  selectedCustomer: any = null;
  selectedMeter: any = null;
  selectedSupplier: any = null;
  filteredSuppliers: any[] = [];
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

  // Reading modals
  showReadingModal = false;
  showReadingsListModal = false;
  selectedMeterForReading: any = null;
  currentReading: any = {
    readingValue: null,
    readingValueHT: null,
    readingValueNT: null,
    readingDate: new Date().toISOString().split('T')[0],
    readingType: 'regular',
    notes: ''
  };
  meterReadings: any[] = [];

  // Customer/Meter/Supplier creation modals
  showCustomerCreationModal = false;
  showMeterCreationModal = false;
  showSupplierCreationModal = false;
  newCustomer: CustomerFormData = this.getEmptyCustomer();
  savingNewCustomer = false;
  newMeter: any = this.getEmptyMeter();
  newSupplier: any = this.getEmptySupplier();
  meterTypes = meterTypes;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Backend search
  isSearchingBackend = false;
  private searchTimeout: any = null;

  // Min-Startdatum für Zähler (basierend auf letztem beendeten Vertrag)
  minStartDateForMeter: string | null = null;

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
    private meterReadingService: MeterReadingService,
    private route: ActivatedRoute,
    private router: Router,
    private packageService: PackageService,
    public viewportService: ViewportService,
    public packageFeatureService: PackageFeatureService,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService,
    private excelExportService: ExcelExportService
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

        // Prüfe Query-Parameter für vorausgewählten Kunden oder Zähler
        this.route.queryParams.subscribe(queryParams => {
          if (queryParams['customerId']) {
            this.openCreateModalWithCustomer(queryParams['customerId']);
          } else if (queryParams['meterId']) {
            this.openCreateModalWithMeter(queryParams['meterId']);
          }
        });
      }
    });
  }

  openCreateModalWithCustomer(customerId: string): void {
    // Warte bis Kunden geladen sind
    const checkCustomers = setInterval(() => {
      if (this.customers.length > 0) {
        clearInterval(checkCustomers);
        const customer = this.customers.find(c => c._id === customerId);
        if (customer) {
          this.openCreateModalWithPreselection(customer, null);
        }
        // Entferne Query-Parameter aus URL
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    }, 100);

    // Timeout nach 5 Sekunden
    setTimeout(() => clearInterval(checkCustomers), 5000);
  }

  openCreateModalWithMeter(meterId: string): void {
    // Warte bis Zähler geladen sind
    const checkMeters = setInterval(() => {
      if (this.freeMeters.length > 0) {
        clearInterval(checkMeters);
        const meter = this.freeMeters.find(m => m._id === meterId);
        if (meter) {
          this.openCreateModalWithPreselection(null, meter);
        }
        // Entferne Query-Parameter aus URL
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    }, 100);

    // Timeout nach 5 Sekunden
    setTimeout(() => clearInterval(checkMeters), 5000);
  }

  private openCreateModalWithPreselection(customer: any, meter: any): void {
    // Prüfe zuerst die Paket-Limits
    this.packageService.getUserLimits().subscribe({
      next: (response) => {
        const userLimits = response.data;

        // Prüfe ob das Vertragslimit erreicht ist
        if (userLimits.limits.isAtContractLimit) {
          this.confirmDialog.confirm({
            title: 'Vertragslimit erreicht',
            message: `Sie haben das Vertragslimit Ihres ${userLimits.package.displayName}-Pakets erreicht!\n\n` +
              `Aktuell: ${userLimits.usage.contracts} / ${userLimits.limits.maxContracts} Verträge\n\n` +
              `Um weitere Verträge anzulegen, müssen Sie Ihr Paket upgraden.\n\n` +
              `Möchten Sie jetzt zur Paket-Verwaltung wechseln?`,
            confirmText: 'Zur Paket-Verwaltung',
            cancelText: 'Abbrechen',
            type: 'warning'
          }).then(confirmed => {
            if (confirmed) {
              this.router.navigate(['/settings']);
            }
          });
          return;
        }

        // Öffne das Formular mit Vorauswahl
        this.isEditMode = false;
        this.currentContract = this.getEmptyContract();
        this.customerSearch = '';
        this.meterSearch = '';
        this.supplierSearch = '';
        this.showCustomerDropdown = false;
        this.showMeterDropdown = false;
        this.showSupplierDropdown = false;
        this.filteredCustomers = this.customers;
        this.filteredFreeMeters = this.freeMeters;
        this.filteredSuppliers = this.suppliers;

        // Setze Vorauswahl
        if (customer) {
          this.selectedCustomer = customer;
          this.currentContract.customerId = customer._id;
        } else {
          this.selectedCustomer = null;
        }

        if (meter) {
          this.selectedMeter = meter;
          this.currentContract.meterId = meter._id;
        } else {
          this.selectedMeter = null;
        }

        this.selectedSupplier = null;
        this.showModal = true;
      },
      error: (err) => {
        console.error('Error checking package limits:', err);
        // Bei Fehler trotzdem Formular öffnen (Backend prüft auch)
        this.isEditMode = false;
        this.currentContract = this.getEmptyContract();
        this.customerSearch = '';
        this.meterSearch = '';
        this.supplierSearch = '';
        this.showCustomerDropdown = false;
        this.showMeterDropdown = false;
        this.showSupplierDropdown = false;
        this.filteredCustomers = this.customers;
        this.filteredFreeMeters = this.freeMeters;
        this.filteredSuppliers = this.suppliers;

        // Setze Vorauswahl
        if (customer) {
          this.selectedCustomer = customer;
          this.currentContract.customerId = customer._id;
        } else {
          this.selectedCustomer = null;
        }

        if (meter) {
          this.selectedMeter = meter;
          this.currentContract.meterId = meter._id;
        } else {
          this.selectedMeter = null;
        }

        this.selectedSupplier = null;
        this.showModal = true;
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

          // Setze ausgewählten Kunden, Zähler und Anbieter für die Anzeige
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

          if (contract.supplierId) {
            this.selectedSupplier = contract.supplierId;
            this.supplierSearch = typeof contract.supplierId === 'object'
              ? contract.supplierId.name
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
        this.toastService.error('Vertrag konnte nicht geladen werden: ' + (error.error?.message || error.message));
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
    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.daysFilter) params.daysRemaining = this.daysFilter;

    this.contractService.getContracts(params).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.contracts = response.data;
          if (response.pagination) {
            this.totalItems = response.pagination.total;
            this.totalPages = response.pagination.pages;
            this.currentPage = response.pagination.page;
          }
          this.applySearchFilter();
        }
      }
    });
  }

  onContractSearchChange(searchTerm: string): void {
    this.contractSearchTerm = searchTerm;
    this.currentPage = 1;

    // Debounce die Suche
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Erst lokal filtern
    this.applyLocalSearchFilter();

    // Wenn keine lokalen Ergebnisse und Suchbegriff vorhanden, Backend-Suche nach kurzer Verzögerung
    if (this.filteredContracts.length === 0 && searchTerm.trim().length >= 2) {
      this.searchTimeout = setTimeout(() => {
        this.searchBackend(searchTerm);
      }, 300);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadContracts();
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadContracts();
  }

  applySearchFilter(): void {
    this.applyLocalSearchFilter();
  }

  applyLocalSearchFilter(): void {
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

  searchBackend(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return;
    }

    this.isSearchingBackend = true;

    const params: any = {
      search: searchTerm.trim(),
      page: 1,
      limit: 50 // Mehr Ergebnisse bei Backend-Suche
    };
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.daysFilter) params.daysRemaining = this.daysFilter;

    this.contractService.getContracts(params).subscribe({
      next: (response: any) => {
        this.isSearchingBackend = false;
        if (response.success) {
          this.filteredContracts = response.data;
          if (response.pagination) {
            this.totalItems = response.pagination.total;
            this.totalPages = response.pagination.pages;
          }
        }
      },
      error: () => {
        this.isSearchingBackend = false;
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
  }

  onCustomerSelected(customer: any): void {
    this.selectCustomer(customer);
  }

  onCustomerCleared(): void {
    this.clearCustomer();
  }

  selectMeter(meter: any): void {
    this.selectedMeter = meter;
    this.currentContract.meterId = meter._id;

    // Min-Startdatum für diesen Zähler abrufen
    this.loadMinStartDateForMeter(meter._id);
  }

  private loadMinStartDateForMeter(meterId: string): void {
    this.contractService.getMinStartDateForMeter(meterId).subscribe({
      next: (response) => {
        this.minStartDateForMeter = response.minStartDate;

        // Falls Startdatum bereits gesetzt und vor dem Mindestdatum liegt, anpassen
        if (this.minStartDateForMeter && this.currentContract.startDate) {
          if (this.currentContract.startDate < this.minStartDateForMeter) {
            this.currentContract.startDate = this.minStartDateForMeter;
          }
        }
      },
      error: (err) => {
        console.error('Fehler beim Abrufen des Min-Startdatums:', err);
        this.minStartDateForMeter = null;
      }
    });
  }

  onMeterSelected(meter: any): void {
    this.selectMeter(meter);
  }

  onMeterCleared(): void {
    this.clearMeter();
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
    this.minStartDateForMeter = null;
  }

  closeCustomerDropdownDelayed(): void {
    setTimeout(() => {
      this.showCustomerDropdown = false;
    }, 200);
  }

  closeMeterDropdownDelayed(): void {
    setTimeout(() => {
      this.showMeterDropdown = false;
    }, 200);
  }

  filterSuppliers(): void {
    const search = this.supplierSearch.toLowerCase().trim();
    if (!search) {
      this.filteredSuppliers = this.suppliers;
    } else {
      this.filteredSuppliers = this.suppliers.filter(supplier => {
        const name = supplier.name?.toLowerCase() || '';
        const shortName = supplier.shortName?.toLowerCase() || '';
        return name.includes(search) || shortName.includes(search);
      });
    }
    this.showSupplierDropdown = true;
  }

  selectSupplier(supplier: any): void {
    this.selectedSupplier = supplier;
    this.currentContract.supplierId = supplier._id;
  }

  onSupplierSelected(supplier: any): void {
    this.selectSupplier(supplier);
  }

  onSupplierCleared(): void {
    this.clearSupplier();
  }

  clearSupplier(): void {
    this.selectedSupplier = null;
    this.currentContract.supplierId = '';
    this.supplierSearch = '';
    this.filteredSuppliers = this.suppliers;
  }

  closeSupplierDropdownDelayed(): void {
    setTimeout(() => {
      this.showSupplierDropdown = false;
    }, 200);
  }

  showCreateModal(): void {
    // Prüfe zuerst die Paket-Limits
    this.packageService.getUserLimits().subscribe({
      next: (response) => {
        const userLimits = response.data;

        // Prüfe ob das Vertragslimit erreicht ist
        if (userLimits.limits.isAtContractLimit) {
          this.confirmDialog.confirm({
            title: 'Vertragslimit erreicht',
            message: `Sie haben das Vertragslimit Ihres ${userLimits.package.displayName}-Pakets erreicht!\n\n` +
              `Aktuell: ${userLimits.usage.contracts} / ${userLimits.limits.maxContracts} Verträge\n\n` +
              `Um weitere Verträge anzulegen, müssen Sie Ihr Paket upgraden.\n\n` +
              `Möchten Sie jetzt zur Paket-Verwaltung wechseln?`,
            confirmText: 'Zur Paket-Verwaltung',
            cancelText: 'Abbrechen',
            type: 'warning'
          }).then(confirmed => {
            if (confirmed) {
              this.router.navigate(['/settings']);
            }
          });
          return;
        }

        // Wenn das Limit nicht erreicht ist, öffne das Formular
        this.isEditMode = false;
        this.currentContract = this.getEmptyContract();
        this.customerSearch = '';
        this.meterSearch = '';
        this.supplierSearch = '';
        this.selectedCustomer = null;
        this.selectedMeter = null;
        this.selectedSupplier = null;
        this.minStartDateForMeter = null;
        this.showCustomerDropdown = false;
        this.showMeterDropdown = false;
        this.showSupplierDropdown = false;
        this.filteredCustomers = this.customers;
        this.filteredFreeMeters = this.freeMeters;
        this.filteredSuppliers = this.suppliers;
        this.showModal = true;
      },
      error: (err) => {
        console.error('Error checking package limits:', err);
        // Bei Fehler trotzdem Formular öffnen (Backend prüft auch)
        this.isEditMode = false;
        this.currentContract = this.getEmptyContract();
        this.customerSearch = '';
        this.meterSearch = '';
        this.supplierSearch = '';
        this.selectedCustomer = null;
        this.selectedMeter = null;
        this.selectedSupplier = null;
        this.minStartDateForMeter = null;
        this.showCustomerDropdown = false;
        this.showMeterDropdown = false;
        this.showSupplierDropdown = false;
        this.filteredCustomers = this.customers;
        this.filteredFreeMeters = this.freeMeters;
        this.filteredSuppliers = this.suppliers;
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

    // Set selected customer, meter and supplier for editing
    this.selectedCustomer = contract.customerId;
    this.selectedMeter = contract.meterId;
    this.selectedSupplier = contract.supplierId;

    this.customerSearch = typeof contract.customerId === 'object'
      ? `${contract.customerId.firstName} ${contract.customerId.lastName}`
      : '';
    this.meterSearch = typeof contract.meterId === 'object'
      ? contract.meterId.meterNumber
      : '';
    this.supplierSearch = typeof contract.supplierId === 'object'
      ? contract.supplierId.name
      : '';
    this.showCustomerDropdown = false;
    this.showMeterDropdown = false;
    this.showSupplierDropdown = false;
    this.filteredCustomers = this.customers;
    this.filteredFreeMeters = this.freeMeters;
    this.filteredSuppliers = this.suppliers;
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
      this.minStartDateForMeter = null;
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
          this.toastService.error('Fehler beim Aktualisieren des Vertrags: ' + (error.error?.message || 'Unbekannter Fehler'));
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
            this.confirmDialog.confirm({
              title: 'Vertragslimit erreicht',
              message: `${errorData.message}\n\nSie haben derzeit ${errorData.currentCount} von ${errorData.maxAllowed} Verträgen.\n\nMöchten Sie Ihr Paket jetzt upgraden?`,
              confirmText: 'Paket upgraden',
              cancelText: 'Abbrechen',
              type: 'warning'
            }).then(confirmed => {
              if (confirmed) {
                this.router.navigate(['/packages']);
              }
            });
          } else {
            this.toastService.error('Fehler beim Erstellen des Vertrags: ' + (errorData?.message || 'Unbekannter Fehler'));
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
            this.toastService.warning('Einige Dateien konnten nicht hochgeladen werden.');
          }
        }
      });
    });
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      active: 'Aktiv',
      ended: 'Beendet',
      archived: 'Gekündigt'
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

  async deleteContract(id: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Vertrag löschen',
      message: 'Möchten Sie diesen Vertrag wirklich löschen?',
      confirmText: 'Löschen',
      cancelText: 'Abbrechen',
      type: 'danger'
    });

    if (!confirmed) return;

    this.contractService.deleteContract(id).subscribe({
      next: () => {
        this.toastService.success('Vertrag erfolgreich gelöscht');
        this.loadContracts();
        this.loadFreeMeters();
      },
      error: (error: any) => {
        this.toastService.error('Fehler beim Löschen des Vertrags: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
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
          this.toastService.error('Kundendetails konnten nicht geladen werden');
        }
      });
    } else {
      this.selectedCustomerDetails = null;
      this.customerContracts = [];
      this.showCustomerDetailsModal = true;
    }
  }

  loadCustomerContracts(customerId: string): void {
    this.contractService.getContracts({ customerId }).subscribe({
      next: (response) => {
        if (response.success) {
          this.customerContracts = response.data;
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Kundenverträge:', error);
        this.customerContracts = [];
      }
    });
  }

  closeCustomerDetails(): void {
    this.showCustomerDetailsModal = false;
    this.selectedCustomerDetails = null;
    this.customerContracts = [];
  }

  createContractForCustomer(customer: any): void {
    if (!customer || !customer._id) return;
    this.closeCustomerDetails();
    // Öffne das Vertragsformular mit vorausgewähltem Kunden
    this.openCreateModalWithPreselection(customer, null);
  }

  onContractClick(contract: CustomerContract): void {
    this.closeCustomerDetails();
    // Lade den vollständigen Vertrag vom Server
    this.contractService.getContract(contract._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.showContractDetails(response.data);
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden des Vertrags:', error);
      }
    });
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
          this.toastService.error('Anbieterdetails konnten nicht geladen werden');
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
          this.toastService.error('Zählerdetails konnten nicht geladen werden');
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
      this.toastService.warning('Datei ist zu groß! Maximale Größe: 10MB');
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
          this.toastService.error('Fehler beim Hochladen: ' + (error.error?.message || 'Unbekannter Fehler'));
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
        this.toastService.error('Fehler beim Herunterladen: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  async deleteAttachment(attachment: any): Promise<void> {
    const fileName = attachment.originalName || attachment.name;
    const confirmed = await this.confirmDialog.confirm({
      title: 'Datei löschen',
      message: `Möchten Sie die Datei "${fileName}" wirklich löschen?`,
      confirmText: 'Löschen',
      cancelText: 'Abbrechen',
      type: 'danger'
    });

    if (!confirmed) return;

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
            this.toastService.success('Datei erfolgreich gelöscht');
            // Attachment aus Liste entfernen
            const index = this.currentContract.attachments.findIndex((a: any) => a._id === attachment._id);
            if (index > -1) {
              this.currentContract.attachments.splice(index, 1);
            }
          }
        },
        error: (error) => {
          this.toastService.error('Fehler beim Löschen: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
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
        this.toastService.error('Fehler beim Laden des Bildes');
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

  // Methods for viewing attachments from Details Modal
  viewImageFromDetails(contractId: string, attachment: any): void {
    this.viewingImage = attachment;
    this.showImageViewer = true;

    this.contractService.downloadAttachment(contractId, attachment._id).subscribe({
      next: (blob) => {
        this.imageViewerUrl = window.URL.createObjectURL(blob);
      },
      error: (error) => {
        console.error('Fehler beim Laden des Bildes:', error);
        this.toastService.error('Fehler beim Laden des Bildes');
        this.closeImageViewer();
      }
    });
  }

  downloadAttachmentFromDetails(contractId: string, attachment: any): void {
    this.contractService.downloadAttachment(contractId, attachment._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.originalName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.toastService.error('Fehler beim Herunterladen: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  openAttachment(contractId: string, attachment: any): void {
    // Bei Bildern: Vorschau öffnen, sonst herunterladen
    if (this.isImage(attachment.mimetype)) {
      this.viewImageFromDetails(contractId, attachment);
    } else {
      this.downloadAttachmentFromDetails(contractId, attachment);
    }
  }

  // Customer/Meter Creation Methods
  getEmptyCustomer(): CustomerFormData {
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

  getEmptySupplier(): any {
    return {
      name: '',
      address: {
        street: '',
        zipCode: '',
        city: '',
        country: 'Deutschland'
      },
      contactEmail: '',
      contactPhone: '',
      website: '',
      notes: ''
    };
  }

  openCustomerCreationModal(): void {
    this.newCustomer = this.getEmptyCustomer();
    this.showCustomerCreationModal = true;
    this.showCustomerDropdown = false;
  }

  // Address Autocomplete für Lieferant
  get newSupplierAddressData(): AddressData {
    return {
      street: this.newSupplier?.address?.street || '',
      zipCode: this.newSupplier?.address?.zipCode || '',
      city: this.newSupplier?.address?.city || ''
    };
  }

  onNewSupplierAddressChange(address: AddressData): void {
    if (this.newSupplier?.address) {
      this.newSupplier.address.street = address.street;
      this.newSupplier.address.zipCode = address.zipCode;
      this.newSupplier.address.city = address.city;
    }
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

  openSupplierCreationModal(): void {
    this.newSupplier = this.getEmptySupplier();
    this.showSupplierCreationModal = true;
    this.showSupplierDropdown = false;
  }

  closeSupplierCreationModal(): void {
    this.showSupplierCreationModal = false;
    this.newSupplier = this.getEmptySupplier();
  }

  saveNewSupplier(): void {
    this.supplierService.createSupplier(this.newSupplier).subscribe({
      next: (response) => {
        if (response.success) {
          const createdSupplier = response.data;

          // Füge den neuen Anbieter zur Liste hinzu
          this.suppliers.push(createdSupplier);
          this.filteredSuppliers = this.suppliers;

          // Wähle den neu erstellten Anbieter automatisch aus
          this.selectSupplier(createdSupplier);

          // Schließe das Modal
          this.closeSupplierCreationModal();

          this.toastService.success('Anbieter erfolgreich erstellt!');
        }
      },
      error: (error) => {
        this.toastService.error('Fehler beim Erstellen des Anbieters: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  saveNewCustomer(customerData: CustomerFormData): void {
    this.savingNewCustomer = true;
    const customerPayload = {
      anrede: customerData.anrede,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      notes: customerData.notes,
      address: {
        street: customerData.address?.street || '',
        zip: customerData.address?.zip || '',
        city: customerData.address?.city || ''
      }
    };

    this.customerService.createCustomer(customerPayload).subscribe({
      next: (response) => {
        this.savingNewCustomer = false;
        if (response.success) {
          const createdCustomer = response.data;

          // Füge den neuen Kunden zur Liste hinzu
          this.customers.push(createdCustomer);
          this.filteredCustomers = this.customers;

          // Wähle den neu erstellten Kunden automatisch aus
          this.selectCustomer(createdCustomer);

          // Schließe das Modal
          this.closeCustomerCreationModal();
        }
      },
      error: (error) => {
        this.savingNewCustomer = false;
        this.toastService.error('Fehler beim Erstellen des Kunden: ' + (error.error?.message || 'Unbekannter Fehler'));
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

          this.toastService.success('Zähler erfolgreich erstellt!');
        }
      },
      error: (error) => {
        this.toastService.error('Fehler beim Erstellen des Zählers: ' + (error.error?.message || 'Unbekannter Fehler'));
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

  // Reading methods
  showAddReadingModal(meter: any): void {
    this.selectedMeterForReading = meter;
    this.currentReading = {
      readingValue: null,
      readingValueHT: null,
      readingValueNT: null,
      readingDate: new Date().toISOString().split('T')[0],
      readingType: 'regular',
      notes: ''
    };
    this.showReadingModal = true;
  }

  closeReadingModal(): void {
    this.showReadingModal = false;
    this.selectedMeterForReading = null;
  }

  saveReading(): void {
    if (!this.selectedMeterForReading ||
        (this.selectedMeterForReading.isTwoTariff && !this.currentReading.readingValueHT) ||
        (!this.selectedMeterForReading.isTwoTariff && !this.currentReading.readingValue)) {
      this.toastService.warning('Bitte geben Sie einen Zählerstand ein');
      return;
    }

    this.meterReadingService.createReading(this.selectedMeterForReading._id, this.currentReading).subscribe({
      next: (response) => {
        if (response.success) {
          this.closeReadingModal();
          this.toastService.success('Ablesung erfolgreich gespeichert');
          // Aktualisiere die Zählerdetails
          if (this.selectedMeterDetails) {
            this.meterService.getMeter(this.selectedMeterDetails._id).subscribe({
              next: (res) => {
                if (res.success) {
                  this.selectedMeterDetails = res.data;
                }
              }
            });
          }
        }
      },
      error: (error) => {
        this.toastService.error('Fehler beim Speichern der Ablesung: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  viewMeterReadings(meter: any): void {
    this.selectedMeterForReading = meter;
    this.meterReadingService.getMeterReadings(meter._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.meterReadings = response.data;
          this.showReadingsListModal = true;
        }
      },
      error: (error) => {
        this.toastService.error('Fehler beim Laden der Ablesungen: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  closeReadingsListModal(): void {
    this.showReadingsListModal = false;
    this.meterReadings = [];
    this.selectedMeterForReading = null;
  }

  async deleteReading(readingId: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Ablesung löschen',
      message: 'Möchten Sie diese Ablesung wirklich löschen?',
      confirmText: 'Löschen',
      cancelText: 'Abbrechen',
      type: 'danger'
    });

    if (!confirmed) return;

    this.meterReadingService.deleteReading(this.selectedMeterForReading._id, readingId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Ablesung erfolgreich gelöscht');
          this.viewMeterReadings(this.selectedMeterForReading);
        }
      },
      error: (error) => {
        this.toastService.error('Fehler beim Löschen der Ablesung: ' + (error.error?.message || 'Unbekannter Fehler'));
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

  getMeterUnit(type: string): string {
    return Util.getMeterUnit(type);
  }

  exportToExcel(): void {
    // Lade alle Verträge ohne Pagination für den Export
    const filters: any = { limit: 10000 };
    if (this.statusFilter) filters.status = this.statusFilter;
    if (this.daysFilter) filters.daysRemaining = this.daysFilter;
    if (this.contractSearchTerm) filters.search = this.contractSearchTerm;

    this.contractService.getContracts(filters).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.excelExportService.exportContracts(response.data, 'Verträge');
          this.toastService.success('Export erfolgreich');
        } else {
          this.toastService.info('Keine Daten zum Exportieren');
        }
      },
      error: () => {
        this.toastService.error('Export fehlgeschlagen');
      }
    });
  }
}