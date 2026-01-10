import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Contract, stateToLabel } from '../../models/contract.model';

@Component({
  selector: 'app-contract-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="contract-search">
      <div class="search-container" [class.with-add-button]="showAddButton" [class.has-selection]="selectedContract">
        @if(selectedContract){
          <div class="selected-input">
            <span class="selected-text">
              <strong>{{ selectedContract.contractNumber }}</strong>
              @if(selectedContract.customerId){
                <span class="selected-customer">· {{ selectedContract.customerId.firstName }} {{ selectedContract.customerId.lastName }}</span>
              }
            </span>
            <button type="button" class="btn-clear" (click)="clearSelection(); $event.stopPropagation()">&times;</button>
          </div>
        } @else {
          <input type="text"
                [placeholder]="'CONTRACTS.SEARCH' | translate"
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                (focus)="onFocus()"
                (blur)="closeSuggestionsDelayed()"
                class="form-control search-input"
                autocomplete="off" />
        }
        @if(showAddButton && !selectedContract){
          <button type="button" class="btn-add-inline" (click)="addNew.emit()" [title]="'CONTRACTS.NEW' | translate">
            <i class="fas fa-plus"></i>
          </button>
        }
      </div>

      @if(showDropdown && filteredContracts.length > 0){
        <div class="dropdown-list">
          @for(contract of filteredContracts; track contract._id){
            <div class="dropdown-item"
                [class.selected]="selectedContract?._id === contract._id"
                (mousedown)="selectContract(contract); $event.preventDefault()">
              <span class="contract-number">{{ contract.contractNumber }}</span>
              @if(contract.customerId){
                <span class="contract-customer">- {{ contract.customerId.firstName }} {{ contract.customerId.lastName }}</span>
              }
              @if(contract.status){
                <span class="contract-status" [class]="'status-' + contract.status">
                  {{ getStatusLabel(contract.status) }}
                </span>
              }
            </div>
          }
        </div>
      }

      @if(showDropdown && filteredContracts.length === 0 && searchQuery.length > 0){
        <div class="dropdown-list">
          <div class="dropdown-item no-results">
            {{ 'COMMON.NO_RESULTS' | translate }}
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .contract-search {
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

    .contract-number {
      font-weight: 500;
      color: var(--text-primary, #333);
    }

    .contract-customer {
      font-size: 0.9rem;
      color: var(--text-secondary, #666);
    }

    .contract-status {
      font-size: 0.75rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
      margin-left: auto;
    }

    .contract-status.status-active {
      background: #dcfce7;
      color: #166534;
    }

    .contract-status.status-draft {
      background: #fef3c7;
      color: #92400e;
    }

    .contract-status.status-archived {
      background: #e5e7eb;
      color: #374151;
    }

    .contract-status.status-ended {
      background: #fee2e2;
      color: #991b1b;
    }

    .selected-input {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--primary-color, #6366f1);
      border-radius: 8px;
      background: linear-gradient(135deg, #f0f0ff 0%, #e8e8ff 100%);
      min-height: 46px;
    }

    .search-container.has-selection {
      display: flex;
    }

    .selected-text {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .selected-customer {
      color: var(--text-secondary, #666);
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
export class ContractSearchComponent {
  @Input() contracts: Contract[] = [];
  @Input() selectedContract: Contract | null = null;
  @Input() showAddButton = false;

  @Output() contractSelected = new EventEmitter<Contract>();
  @Output() contractCleared = new EventEmitter<void>();
  @Output() addNew = new EventEmitter<void>();

  searchQuery = '';
  showDropdown = false;
  filteredContracts: Contract[] = [];

  onFocus(): void {
    this.showDropdown = true;
    this.filterContracts();
  }

  onSearchInput(): void {
    this.showDropdown = true;
    this.filterContracts();
  }

  filterContracts(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredContracts = this.contracts.slice(0, 20);
    } else {
      this.filteredContracts = this.contracts.filter(contract => {
        const contractNumber = contract.contractNumber?.toLowerCase() || '';
        const customerName = contract.customerId ?
          `${contract.customerId.firstName} ${contract.customerId.lastName}`.toLowerCase() : '';
        return contractNumber.includes(query) || customerName.includes(query);
      }).slice(0, 20);
    }
  }

  selectContract(contract: Contract): void {
    this.selectedContract = contract;
    this.searchQuery = '';
    this.showDropdown = false;
    this.contractSelected.emit(contract);
  }

  clearSelection(): void {
    this.selectedContract = null;
    this.searchQuery = '';
    this.contractCleared.emit();
  }

  closeSuggestionsDelayed(): void {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  getStatusLabel(status: string): string {
    return stateToLabel[status as keyof typeof stateToLabel] || status;
  }
}
