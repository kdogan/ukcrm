import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MeterService } from '../../services/meter.service';
import { MeterReadingService } from '../../services/meter-reading.service';
import { TableContainerComponent } from '../shared/tablecontainer.component';
import { MetersMobileComponent } from './mobile/meters-mobile.component';
import { ViewportService } from 'src/app/services/viewport.service';
import { Util } from '../util/util';
import { OverlayModalComponent } from '../shared/overlay-modal.component';
import { Meter } from 'src/app/models/meter.model';
import { MeterCreateComponent } from '../shared/meter-create.component';
import { SearchInputComponent } from '../shared/search-input.component';

@Component({
    selector: 'app-meters',
    standalone: true,
    imports: [CommonModule, FormsModule,
      TableContainerComponent,
      MetersMobileComponent,
      OverlayModalComponent, MeterCreateComponent,
      SearchInputComponent],
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

  constructor(
    private meterService: MeterService,
    private meterReadingService: MeterReadingService,
    private route: ActivatedRoute,
    private viewport: ViewportService
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
  filterMeters(): void {
    this.loadMeters();
  }

  loadMeters(): void {
    const params: any = {};
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.statusFilter) params.isFree = this.statusFilter === 'free' ? 'true' : 'false';
    if (this.typeFilter) params.type = this.typeFilter;

    this.meterService.getMeters(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.meters = response.data;
          this.filteredMeters = response.data;
        }
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
    return Util.getMeterTypeLabel(type);
  }

  viewHistory(meterId: string): void {
    alert('Historie-Ansicht für Zähler: ' + meterId);
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
    if (!this.selectedMeterForReading || !this.currentReading.readingValue) {
      alert('Bitte geben Sie einen Zählerstand ein');
      return;
    }

    this.meterReadingService.createReading(this.selectedMeterForReading._id, this.currentReading).subscribe({
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
    this.selectedMeterForReading = meter;
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
    this.selectedMeterForReading = null;
  }

  deleteReading(readingId: string): void {
    if (!confirm('Möchten Sie diese Ablesung wirklich löschen?')) {
      return;
    }

    this.meterReadingService.deleteReading(this.selectedMeterForReading._id, readingId).subscribe({
      next: (response) => {
        if (response.success) {
          this.viewReadings(this.selectedMeterForReading); // Reload readings
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

  showMeterDetails(meter: Meter): void {
    this.selectedMeterForDetails = meter;
    this.showMeterModalForDetails = true;

    this.meterReadingService.getMeterReadings(meter._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.meterReadings = res.data;
        }
      }
    });
  }
}
