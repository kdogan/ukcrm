import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService, Supplier } from '../../services/supplier.service';
import { TableContainerComponent } from '../shared/tablecontainer.component';
import { ViewportService } from '../../services/viewport.service';
import { SuppliersMobileComponent } from './mobile/suppliers-mobile.component';
import { OverlayModalComponent } from "../shared/overlay-modal.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-suppliers',
    imports: [CommonModule, FormsModule, TableContainerComponent, SuppliersMobileComponent, OverlayModalComponent, TranslateModule],
    templateUrl:'supplier.component.html',
    styleUrls:['supplier.component.scss']
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  filterActive?: boolean = undefined;
  showModal = false;
  showDetailsModal = false;
  editMode = false;
  currentSupplier: Partial<Supplier> = { address: {} };
  selectedSupplier: Supplier | null = null;
  activeMenuId: string | null = null;

  constructor(
    private supplierService: SupplierService,
    private viewport: ViewportService
  ) {}

  get isMobile() {
    return this.viewport.isMobile();
  }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers({
      isActive: this.filterActive
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.suppliers = response.data;
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Anbieter:', error);
      }
    });
  }

  showCreateModal(): void {
    this.editMode = false;
    this.currentSupplier = { address: {} };
    this.showModal = true;
  }

  editSupplier(supplier: Supplier): void {
    this.editMode = true;
    this.currentSupplier = {
      ...supplier,
      address: { ...supplier.address }
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentSupplier = { address: {} };
  }

  showSupplierDetails(supplier: Supplier): void {
    this.selectedSupplier = supplier;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedSupplier = null;
  }

  saveSupplier(): void {
    if (this.editMode && this.currentSupplier._id) {
      this.supplierService.updateSupplier(this.currentSupplier._id, this.currentSupplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeModal();
        },
        error: (error) => {
          console.error('Fehler beim Aktualisieren des Anbieters:', error);
          let errorMessage = 'Fehler beim Aktualisieren des Anbieters';
          if (error.status === 403) {
            errorMessage = 'Keine Berechtigung zum Aktualisieren des Anbieters';
          } else if (error.status === 401) {
            errorMessage = 'Bitte melden Sie sich erneut an';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          alert(errorMessage);
        }
      });
    } else {
      this.supplierService.createSupplier(this.currentSupplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeModal();
        },
        error: (error) => {
          console.error('Fehler beim Erstellen des Anbieters:', error);
          let errorMessage = 'Fehler beim Erstellen des Anbieters';
          if (error.status === 403) {
            errorMessage = 'Keine Berechtigung zum Erstellen eines Anbieters';
          } else if (error.status === 401) {
            errorMessage = 'Bitte melden Sie sich erneut an';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          alert(errorMessage);
        }
      });
    }
  }

  deleteSupplier(id: string): void {
    if (confirm('Anbieter wirklich löschen?')) {
      this.supplierService.deleteSupplier(id).subscribe({
        next: () => this.loadSuppliers(),
        error: (error) => {
          console.error('Fehler beim Löschen des Anbieters:', error);
          alert('Fehler beim Löschen des Anbieters');
        }
      });
    }
  }

  toggleActionMenu(id: string): void {
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  closeActionMenu(): void {
    this.activeMenuId = null;
  }
}
