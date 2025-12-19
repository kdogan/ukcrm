import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService, Customer } from '../../services/customer.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Kunden</h1>
        <button class="btn-primary" (click)="showCreateModal()">+ Neuer Kunde</button>
      </div>

      <div class="filters">
        <input
          type="search"
          placeholder="Suche nach Name, E-Mail..."
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearchChange()"
          class="search-input"
        />
        <select [(ngModel)]="filterActive" (ngModelChange)="loadCustomers()" class="filter-select">
          <option [ngValue]="undefined">Alle</option>
          <option [ngValue]="true">Aktiv</option>
          <option [ngValue]="false">Inaktiv</option>
        </select>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Kundennr.</th>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Telefon</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let customer of customers">
              <td>{{ customer.customerNumber }}</td>
              <td>{{ customer.firstName }} {{ customer.lastName }}</td>
              <td>{{ customer.email || '-' }}</td>
              <td>{{ customer.phone || '-' }}</td>
              <td>
                <span class="badge" [class.badge-active]="customer.isActive">
                  {{ customer.isActive ? 'Aktiv' : 'Inaktiv' }}
                </span>
              </td>
              <td>
                <button class="btn-small" (click)="editCustomer(customer)">Bearbeiten</button>
                <button
                  class="btn-small btn-danger"
                  *ngIf="customer.isActive"
                  (click)="deactivateCustomer(customer._id)"
                >
                  Deaktivieren
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create/Edit Modal -->
      <div class="modal" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>{{ editMode ? 'Kunde bearbeiten' : 'Neuer Kunde' }}</h2>
          <form (ngSubmit)="saveCustomer()">
            <div class="form-row">
              <div class="form-group">
                <label>Vorname*</label>
                <input type="text" [(ngModel)]="currentCustomer.firstName" name="firstName" required />
              </div>
              <div class="form-group">
                <label>Nachname*</label>
                <input type="text" [(ngModel)]="currentCustomer.lastName" name="lastName" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>E-Mail</label>
                <input type="email" [(ngModel)]="currentCustomer.email" name="email" />
              </div>
              <div class="form-group">
                <label>Telefon</label>
                <input type="tel" [(ngModel)]="currentCustomer.phone" name="phone" />
              </div>
            </div>
            <div class="form-group">
              <label>Notizen</label>
              <textarea [(ngModel)]="currentCustomer.notes" name="notes" rows="3"></textarea>
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
    }
    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }
  `]
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  searchTerm = '';
  filterActive?: boolean = undefined;
  showModal = false;
  editMode = false;
  currentCustomer: Partial<Customer> = {};

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getCustomers({
      isActive: this.filterActive,
      search: this.searchTerm
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.customers = response.data;
        }
      }
    });
  }

  onSearchChange(): void {
    setTimeout(() => this.loadCustomers(), 300);
  }

  showCreateModal(): void {
    this.editMode = false;
    this.currentCustomer = {};
    this.showModal = true;
  }

  editCustomer(customer: Customer): void {
    this.editMode = true;
    this.currentCustomer = { ...customer };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentCustomer = {};
  }

  saveCustomer(): void {
    if (this.editMode && this.currentCustomer._id) {
      this.customerService.updateCustomer(this.currentCustomer._id, this.currentCustomer).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
        }
      });
    } else {
      this.customerService.createCustomer(this.currentCustomer).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
        }
      });
    }
  }

  deactivateCustomer(id: string): void {
    if (confirm('Kunde wirklich deaktivieren?')) {
      this.customerService.deactivateCustomer(id).subscribe({
        next: () => this.loadCustomers()
      });
    }
  }
}
