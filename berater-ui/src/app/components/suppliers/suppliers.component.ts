import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService, Supplier } from '../../services/supplier.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container" (click)="closeActionMenu()">
      <div class="page-header">
        <h1>Anbieter</h1>
        <button class="btn-primary" (click)="showCreateModal()">+ Neuer Anbieter</button>
      </div>

      <div class="filters">
        <select [(ngModel)]="filterActive" (ngModelChange)="loadSuppliers()" class="filter-select">
          <option [ngValue]="undefined">Alle</option>
          <option [ngValue]="true">Aktiv</option>
          <option [ngValue]="false">Inaktiv</option>
        </select>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kurzbezeichnung</th>
              <th>Adresse</th>
              <th>Telefon</th>
              <th>E-Mail</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let supplier of suppliers">
              <td>{{ supplier.name }}</td>
              <td>{{ supplier.shortName }}</td>
              <td>
                <span *ngIf="supplier.address?.street || supplier.address?.city">
                  <span *ngIf="supplier.address?.street">{{ supplier.address?.street }}<br></span>
                  <span *ngIf="supplier.address?.zipCode || supplier.address?.city">
                    {{ supplier.address?.zipCode }} {{ supplier.address?.city }}
                  </span>
                </span>
                <span *ngIf="!supplier.address?.street && !supplier.address?.city">-</span>
              </td>
              <td>
                <span *ngIf="supplier.contactPhone" class="phone-container">
                  {{ supplier.contactPhone }}
                  <a [href]="'tel:' + supplier.contactPhone" class="phone-icon" title="Anrufen">📞</a>
                </span>
                <span *ngIf="!supplier.contactPhone">-</span>
              </td>
              <td>{{ supplier.contactEmail || '-' }}</td>
              <td>
                <span class="badge" [class.badge-active]="supplier.isActive">
                  {{ supplier.isActive ? 'Aktiv' : 'Inaktiv' }}
                </span>
              </td>
              <td class="actions-cell">
                <div class="action-menu-container">
                  <button class="action-menu-btn" (click)="toggleActionMenu(supplier._id); $event.stopPropagation()">
                    ⋮
                  </button>
                  <div class="action-menu" *ngIf="activeMenuId === supplier._id" (click)="$event.stopPropagation()">
                    <button class="menu-item" (click)="editSupplier(supplier); closeActionMenu()">
                      ✏️ Bearbeiten
                    </button>
                    <button
                      class="menu-item menu-item-danger"
                      *ngIf="supplier.isActive"
                      (click)="deleteSupplier(supplier._id); closeActionMenu()"
                    >
                      🗑️ Löschen
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create/Edit Modal -->
      <div class="modal" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>{{ editMode ? 'Anbieter bearbeiten' : 'Neuer Anbieter' }}</h2>
          <form (ngSubmit)="saveSupplier()">
            <div class="form-row">
              <div class="form-group">
                <label>Name*</label>
                <input type="text" [(ngModel)]="currentSupplier.name" name="name" required />
              </div>
              <div class="form-group">
                <label>Kurzbezeichnung*</label>
                <input type="text" [(ngModel)]="currentSupplier.shortName" name="shortName" required />
              </div>
            </div>

            <h3 class="section-title">Adresse</h3>
            <div class="form-group">
              <label>Straße</label>
              <input type="text" [(ngModel)]="currentSupplier.address!.street" name="street" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>PLZ</label>
                <input type="text" [(ngModel)]="currentSupplier.address!.zipCode" name="zipCode" />
              </div>
              <div class="form-group">
                <label>Stadt</label>
                <input type="text" [(ngModel)]="currentSupplier.address!.city" name="city" />
              </div>
            </div>
            <div class="form-group">
              <label>Land</label>
              <input type="text" [(ngModel)]="currentSupplier.address!.country" name="country" />
            </div>

            <h3 class="section-title">Kontakt</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Telefon</label>
                <input type="tel" [(ngModel)]="currentSupplier.contactPhone" name="contactPhone" />
              </div>
              <div class="form-group">
                <label>E-Mail</label>
                <input type="email" [(ngModel)]="currentSupplier.contactEmail" name="contactEmail" />
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeModal()">Abbrechen</button>
              <button type="submit" class="btn-primary">Speichern</button>
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
    h1 { font-size: 2rem; color: #333; margin: 0; }
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .filter-select {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
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
    .phone-container {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .phone-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      text-decoration: none;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .phone-icon:hover {
      transform: scale(1.2);
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      background: #ffebee;
      color: #c62828;
      font-size: 0.875rem;
    }
    .badge-active { background: #e8f5e9; color: #2e7d32; }
    .btn-primary, .btn-secondary {
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
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-content h2 { margin-top: 0; }
    .section-title {
      font-size: 1.2rem;
      color: #555;
      margin: 1.5rem 0 1rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e0e0e0;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
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
      min-width: 160px;
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
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  filterActive?: boolean = undefined;
  showModal = false;
  editMode = false;
  currentSupplier: Partial<Supplier> = { address: {} };
  activeMenuId: string | null = null;

  constructor(private supplierService: SupplierService) {}

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

  saveSupplier(): void {
    if (this.editMode && this.currentSupplier._id) {
      this.supplierService.updateSupplier(this.currentSupplier._id, this.currentSupplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeModal();
        },
        error: (error) => {
          console.error('Fehler beim Aktualisieren des Anbieters:', error);
          alert('Fehler beim Aktualisieren des Anbieters');
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
          alert('Fehler beim Erstellen des Anbieters');
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
