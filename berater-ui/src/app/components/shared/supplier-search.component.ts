import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Supplier } from '../../services/supplier.service';

@Component({
  selector: 'app-supplier-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="supplier-search">
      <div class="search-container" [class.with-add-button]="showAddButton" [class.has-selection]="selectedSupplier">
        @if(selectedSupplier){
          <div class="selected-input">
            <span class="selected-text">
              {{ selectedSupplier.name }}
              @if(formatAddress(selectedSupplier)){
                <span class="selected-address">· {{ formatAddress(selectedSupplier) }}</span>
              }
            </span>
            <button type="button" class="btn-clear" (click)="clearSelection(); $event.stopPropagation()">&times;</button>
          </div>
        } @else {
          <input type="text"
                [placeholder]="'SUPPLIERS.SEARCH' | translate"
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                (focus)="onFocus()"
                (blur)="closeSuggestionsDelayed()"
                class="form-control search-input"
                autocomplete="off" />
        }
        @if(showAddButton && !selectedSupplier){
          <button type="button" class="btn-add-inline" (click)="addNew.emit()" [title]="'SUPPLIERS.NEW' | translate">
            <i class="fas fa-plus"></i>
          </button>
        }
      </div>

      @if(showDropdown && filteredSuppliers.length > 0){
        <div class="dropdown-list">
          @for(supplier of filteredSuppliers; track supplier._id){
            <div class="dropdown-item"
                [class.selected]="selectedSupplier?._id === supplier._id"
                (mousedown)="selectSupplier(supplier); $event.preventDefault()">
              <span class="supplier-name">{{ supplier.name }}</span>
              @if(supplier.address?.city){
                <span class="supplier-location">{{ formatAddress(supplier) }}</span>
              }
            </div>
          }
        </div>
      }

      @if(showDropdown && filteredSuppliers.length === 0 && searchQuery.length > 0){
        <div class="dropdown-list">
          <div class="dropdown-item no-results">
            {{ 'COMMON.NO_RESULTS' | translate }}
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .supplier-search {
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

    .supplier-name {
      font-weight: 500;
      color: var(--text-primary, #333);
    }

    .supplier-location {
      font-size: 0.85rem;
      color: var(--text-secondary, #888);
      width: 100%;
    }

    .selected-input {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
      border: 1px solid #a855f7;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      min-height: 46px;
    }

    .selected-text {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.25rem;
      font-weight: 500;
      color: var(--text-primary, #333);
    }

    .selected-address {
      color: var(--text-secondary, #666);
      font-size: 0.9rem;
      font-weight: normal;
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
      flex-shrink: 0;
    }

    .btn-clear:hover {
      color: #ef4444;
    }
  `]
})
export class SupplierSearchComponent {
  @Input() suppliers: Supplier[] = [];
  @Input() selectedSupplier: Supplier | null = null;
  @Input() showAddButton = false;

  @Output() supplierSelected = new EventEmitter<Supplier>();
  @Output() supplierCleared = new EventEmitter<void>();
  @Output() addNew = new EventEmitter<void>();

  searchQuery = '';
  showDropdown = false;
  filteredSuppliers: Supplier[] = [];

  onFocus(): void {
    this.showDropdown = true;
    this.filterSuppliers();
  }

  onSearchInput(): void {
    this.showDropdown = true;
    this.filterSuppliers();
  }

  filterSuppliers(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredSuppliers = this.suppliers.slice(0, 20);
    } else {
      this.filteredSuppliers = this.suppliers.filter(supplier =>
        supplier.name?.toLowerCase().includes(query) ||
        supplier.address?.city?.toLowerCase().includes(query)
      ).slice(0, 20);
    }
  }

  selectSupplier(supplier: Supplier): void {
    this.selectedSupplier = supplier;
    this.searchQuery = '';
    this.showDropdown = false;
    this.supplierSelected.emit(supplier);
  }

  clearSelection(): void {
    this.selectedSupplier = null;
    this.searchQuery = '';
    this.supplierCleared.emit();
  }

  closeSuggestionsDelayed(): void {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  formatAddress(supplier: Supplier): string {
    if (!supplier.address) return '';
    const parts: string[] = [];
    if (supplier.address.street) parts.push(supplier.address.street);
    if (supplier.address.zipCode || supplier.address.city) {
      parts.push(`${supplier.address.zipCode || ''} ${supplier.address.city || ''}`.trim());
    }
    return parts.join(', ');
  }
}
