import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MeterService } from '../../services/meter.service';
import { MeterReadingService, YearlyConsumptionResponse, YearlyEstimate } from '../../services/meter-reading.service';
import { ContractService } from '../../services/contract.service';
import { CustomerService } from '../../services/customer.service';
import { TableContainerComponent } from '../shared/tablecontainer.component';
import { MetersMobileComponent } from './mobile/meters-mobile.component';
import { ViewportService } from 'src/app/services/viewport.service';
import { Util } from '../util/util';
import { OverlayModalComponent } from '../shared/overlay-modal.component';
import { Meter } from 'src/app/models/meter.model';
import { MeterCreateComponent } from '../shared/meter-create.component';
import { SearchInputComponent } from '../shared/search-input.component';
import { TranslateModule } from '@ngx-translate/core';
import { CustomerDetailComponent, CustomerContract } from '../shared/customer-detail.component';
import { MeterDetailComponent, MeterContract } from '../shared/meter-detail.component';
import { Customer } from '../../services/customer.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { ExcelExportService } from '../../services/excel-export.service';

@Component({
    selector: 'app-meters',
    standalone: true,
    imports: [CommonModule, FormsModule,
      TableContainerComponent,
      MetersMobileComponent,
      OverlayModalComponent, MeterCreateComponent,
      SearchInputComponent, TranslateModule, CustomerDetailComponent, MeterDetailComponent],
    styleUrls: ['./meters.component.scss'],
    templateUrl: './meters.component.html'
})
export class MetersComponent implements OnInit {
  meters: any[] = [];
  filteredMeters: any[] = [];
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
  showMeterModalForDetails = false;
  selectedMeterForReading: any = null;
  selectedMeterForDetails: any = null;
  currentReading: any = {
    readingValue: null,
    readingValueHT: null,
    readingValueNT: null,
    readingDate: new Date().toISOString().split('T')[0],
    readingType: 'regular',
    notes: ''
  };
  meterReadings: any[] = [];
meterTypes: any;

  // Customer details modal
  showCustomerDetailsModal = false;
  selectedCustomer: Customer | null = null;
  customerContracts: CustomerContract[] = [];

  // Meter contracts (for meter details modal)
  meterContracts: any[] = [];

  // Yearly consumption estimates
  showYearlyEstimatesModal = false;
  yearlyEstimatesData: YearlyConsumptionResponse | null = null;
  yearlyEstimatesLoading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  constructor(
    private meterService: MeterService,
    private meterReadingService: MeterReadingService,
    private contractService: ContractService,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router,
    private viewport: ViewportService,
    private toastService: ToastService,
    private confirmDialog: ConfirmDialogService,
    private excelExportService: ExcelExportService
  ) { }

  ngOnInit(): void {
    this.loadMeters();
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

  get isMobile() {
    return this.viewport.isMobile();
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
        this.toastService.error('Zähler konnte nicht geladen werden');
      }
    });
  }

  getEmptyMeter(): any {
    return {
      meterNumber: '',
      type: '',
      manufacturer: '',
      yearBuilt: null,
      isTwoTariff: false,
      location: {
        street: '',
        zip: '',
        city: ''
      }
    };
  }
  filterMeters(): void {
    this.currentPage = 1;
    this.loadMeters();
  }

  loadMeters(): void {
    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.statusFilter) params.isFree = this.statusFilter === 'free' ? 'true' : 'false';
    if (this.typeFilter) params.type = this.typeFilter;

    this.meterService.getMeters(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.meters = response.data;
          this.filteredMeters = response.data;
          if (response.pagination) {
            this.totalItems = response.pagination.total;
            this.totalPages = response.pagination.pages;
            this.currentPage = response.pagination.page;
          }
        }
      }
    });
  }

  onSearchChange(): void {
    this.currentPage = 1;
    setTimeout(() => this.loadMeters(), 300);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadMeters();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadMeters();
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
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
          this.toastService.error('Fehler beim Aktualisieren des Zählers: ' + (error.error?.message || 'Unbekannter Fehler'));
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
          this.toastService.error('Fehler beim Erstellen des Zählers: ' + (error.error?.message || 'Unbekannter Fehler'));
        }
      });
    }
  }

  getTypeLabel(type: string): string {
    return Util.getMeterTypeLabel(type);
  }

  viewHistory(meterId: string): void {
    this.toastService.info('Historie-Ansicht für Zähler: ' + meterId);
  }

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

  closeMeterModalDetails(): void {
    this.showMeterModalForDetails = false;
    this.selectedMeterForDetails = null;
  }

  saveReading(): void {

    if (!this.selectedMeterForReading || (this.selectedMeterForReading.isTwoTariff && !this.currentReading.readingValueHT) ||
       (!this.selectedMeterForReading.isTwoTariff && !this.currentReading.readingValue)) {
      this.toastService.warning('Bitte geben Sie einen Zählerstand ein');
      return;
    }

    this.meterReadingService.createReading(this.selectedMeterForReading._id, this.currentReading).subscribe({
      next: (response) => {
        if (response.success) {
          this.closeReadingModal();
          this.loadMeters(); // Reload to get updated reading
          this.toastService.success('Ablesung erfolgreich gespeichert');
        }
      },
      error: (error) => {
        this.toastService.error('Fehler beim Speichern der Ablesung: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  viewReadings(meter: any): void {
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
          this.viewReadings(this.selectedMeterForReading); // Reload readings
          this.loadMeters(); // Reload meters to update current reading
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

  toggleActionMenu(id: string): void {
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  closeActionMenu(): void {
    this.activeMenuId = null;
  }

  async deleteMeter(id: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Zähler löschen',
      message: 'Möchten Sie diesen Zähler wirklich löschen?',
      confirmText: 'Löschen',
      cancelText: 'Abbrechen',
      type: 'danger'
    });

    if (!confirmed) return;

    this.meterService.deleteMeter(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadMeters();
          this.toastService.success('Zähler erfolgreich gelöscht');
        }
      },
      error: (error) => {
        this.toastService.error('Fehler beim Löschen des Zählers: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  showMeterDetails(meter: Meter): void {
    this.selectedMeterForDetails = meter;
    this.showMeterModalForDetails = true;
    this.meterContracts = [];

    this.meterReadingService.getMeterReadings(meter._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.meterReadings = res.data;
        }
      }
    });

    // Lade Verträge die diesem Zähler zugewiesen sind
    this.contractService.getContracts({ meterId: meter._id }).subscribe({
      next: (res) => {
        if (res.success) {
          this.meterContracts = res.data;
        }
      }
    });
  }

  showCustomerDetails(customer: any): void {
    if (!customer || !customer._id) return;

    this.selectedCustomer = null;
    this.customerContracts = [];
    this.showCustomerDetailsModal = true;

    // Lade vollständige Kundendaten
    this.customerService.getCustomer(customer._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedCustomer = response.data;
        }
      }
    });

    // Lade Verträge des Kunden
    this.contractService.getContracts({ customerId: customer._id }).subscribe({
      next: (response) => {
        if (response.success) {
          this.customerContracts = response.data;
        }
      }
    });
  }

  closeCustomerDetailsModal(): void {
    this.showCustomerDetailsModal = false;
    this.selectedCustomer = null;
    this.customerContracts = [];
  }

  // Yearly consumption estimates methods
  showYearlyEstimates(meter: any): void {
    this.selectedMeterForReading = meter;
    this.yearlyEstimatesData = null;
    this.yearlyEstimatesLoading = true;
    this.showYearlyEstimatesModal = true;

    this.meterReadingService.getYearlyEstimates(meter._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.yearlyEstimatesData = response.data;
        }
        this.yearlyEstimatesLoading = false;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Jahresschätzungen:', error);
        this.yearlyEstimatesLoading = false;
        this.toastService.error('Fehler beim Laden der Jahresschätzungen: ' + (error.error?.message || 'Unbekannter Fehler'));
      }
    });
  }

  closeYearlyEstimatesModal(): void {
    this.showYearlyEstimatesModal = false;
    this.yearlyEstimatesData = null;
    this.selectedMeterForReading = null;
  }

  isYearlyEstimateSingle(estimate: YearlyEstimate): boolean {
    return estimate.hasEstimate && estimate.type === 'single';
  }

  isYearlyEstimateTwoTariff(estimate: YearlyEstimate): boolean {
    return estimate.hasEstimate && estimate.type === 'twoTariff';
  }

  navigateToContract(contractId: string): void {
    this.closeMeterModalDetails();
    this.router.navigate(['/contracts', contractId]);
  }

  createContractForMeter(meter: Meter): void {
    this.router.navigate(['/contracts'], { queryParams: { meterId: meter._id } });
  }

  exportToExcel(): void {
    // Lade alle Zähler ohne Pagination für den Export
    const params: any = { limit: 10000 };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.statusFilter) params.isFree = this.statusFilter === 'free' ? 'true' : 'false';
    if (this.typeFilter) params.type = this.typeFilter;

    this.meterService.getMeters(params).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.excelExportService.exportMeters(response.data, 'Zähler');
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
