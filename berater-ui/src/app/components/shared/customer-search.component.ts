import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Customer } from '../../services/customer.service';

@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="customer-search">
      <div class="search-container" [class.with-add-button]="showAddButton">
        <input type="text"
              [placeholder]="'CUSTOMERS.SEARCH' | translate"
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              (focus)="onFocus()"
              (blur)="closeSuggestionsDelayed()"
              class="form-control search-input"
              autocomplete="off" />
        @if(showAddButton){
          <button type="button" class="btn-add-inline" (click)="addNew.emit()" [title]="'CUSTOMERS.NEW' | translate">
            <i class="fas fa-plus"></i>
          </button>
        }
      </div>

      @if(showDropdown && filteredCustomers.length > 0){
        <div class="dropdown-list">
          @for(customer of filteredCustomers; track customer._id){
            <div class="dropdown-item"
                [class.selected]="selectedCustomer?._id === customer._id"
                (mousedown)="selectCustomer(customer); $event.preventDefault()">
              <span class="customer-name">{{ customer.firstName }} {{ customer.lastName }}</span>
              <!-- @if(customer.customerNumber){
                <span class="customer-number">#{{ customer.customerNumber }}</span>
              } -->
              @if(formatAddress(customer)){
                <span class="customer-address">{{ formatAddress(customer) }}</span>
              }
            </div>
          }
        </div>
      }

      @if(showDropdown && filteredCustomers.length === 0 && searchQuery.length > 0){
        <div class="dropdown-list">
          <div class="dropdown-item no-results">
            {{ 'COMMON.NO_RESULTS' | translate }}
          </div>
        </div>
      }

      @if(selectedCustomer){
        <div class="selected-item">
          <span class="selected-text">
            <strong>{{ selectedCustomer.firstName }} {{ selectedCustomer.lastName }}</strong>
            @if(selectedCustomer.customerNumber){
              <span class="selected-number">(#{{ selectedCustomer.customerNumber }})</span>
            }
            @if(formatAddress(selectedCustomer)){
              <span class="selected-address">- {{ formatAddress(selectedCustomer) }}</span>
            }
          </span>
          <button type="button" class="btn-clear" (click)="clearSelection()">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .customer-search {
      position: relative;
    }

    .search-container {
      display: flex;
      gap: 0.5rem;
    }

    .search-container.with-add-button .search-input {
      flex: 1;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-light, #e0e0e0);
      border-radius: 8px;
      font-size: 0.95rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-color, #6366f1);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .btn-add-inline {
      background: var(--primary-color, #6366f1);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .btn-add-inline:hover {
      background: var(--primary-dark, #4f46e5);
    }

    .dropdown-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      max-height: 250px;
      overflow-y: auto;
      background: white;
      border: 1px solid var(--border-light, #e0e0e0);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      margin-top: 4px;
    }

    .dropdown-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 1px solid var(--border-light, #f0f0f0);
      transition: background 0.15s;
    }

    .dropdown-item:last-child {
      border-bottom: none;
    }

    .dropdown-item:hover {
      background: var(--bg-hover, #f5f5f5);
    }

    .dropdown-item.selected {
      background: rgba(99, 102, 241, 0.1);
    }

    .dropdown-item.no-results {
      color: var(--text-secondary, #666);
      font-style: italic;
      cursor: default;
    }

    .dropdown-item.no-results:hover {
      background: transparent;
    }

    .customer-name {
      font-weight: 500;
      color: var(--text-primary, #333);
    }

    .customer-number {
      font-size: 0.85rem;
      color: var(--text-secondary, #666);
      background: var(--bg-light, #f0f0f0);
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
    }

    .customer-address {
      font-size: 0.85rem;
      color: var(--text-secondary, #888);
      width: 100%;
    }

    .selected-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      border: 1px solid #4caf50;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin-top: 0.5rem;
    }

    .selected-text {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .selected-number {
      color: var(--text-secondary, #666);
      font-weight: normal;
    }

    .selected-address {
      color: var(--text-secondary, #666);
      font-size: 0.9rem;
    }

    .btn-clear {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: var(--text-secondary, #888);
      cursor: pointer;
      padding: 0 0.5rem;
      line-height: 1;
      transition: color 0.2s;
    }

    .btn-clear:hover {
      color: #ef4444;
    }
  `]
})
export class CustomerSearchComponent {
  @Input() customers: Customer[] = [];
  @Input() selectedCustomer: Customer | null = null;
  @Input() showAddButton = false;

  @Output() customerSelected = new EventEmitter<Customer>();
  @Output() customerCleared = new EventEmitter<void>();
  @Output() addNew = new EventEmitter<void>();

  searchQuery = '';
  showDropdown = false;
  filteredCustomers: Customer[] = [];

  onFocus(): void {
    this.showDropdown = true;
    this.filterCustomers();
  }

  onSearchInput(): void {
    this.showDropdown = true;
    this.filterCustomers();
  }

  filterCustomers(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredCustomers = this.customers.slice(0, 20);
    } else {
      this.filteredCustomers = this.customers.filter(customer =>
        customer.firstName?.toLowerCase().includes(query) ||
        customer.lastName?.toLowerCase().includes(query) ||
        customer.customerNumber?.toLowerCase().includes(query) ||
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(query)
      ).slice(0, 20);
    }
  }

  selectCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
    this.searchQuery = '';
    this.showDropdown = false;
    this.customerSelected.emit(customer);
  }

  clearSelection(): void {
    this.selectedCustomer = null;
    this.searchQuery = '';
    this.customerCleared.emit();
  }

  closeSuggestionsDelayed(): void {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  formatAddress(customer: Customer): string {
    if (!customer.address) return '';
    const parts: string[] = [];
    if (customer.address.street) parts.push(customer.address.street);
    if (customer.address.zip || customer.address.city) {
      parts.push(`${customer.address.zip || ''} ${customer.address.city || ''}`.trim());
    }
    return parts.join(', ');
  }
}
