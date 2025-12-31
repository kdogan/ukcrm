import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contract, ContractState, stateToLabel } from 'src/app/models/contract.model';
import { SearchInputComponent } from 'src/app/components/shared/search-input.component';

@Component({
    selector: 'app-contracts-mobile',
    imports: [CommonModule, FormsModule, SearchInputComponent],
    templateUrl: './contracts-mobile.component.html',
    styleUrls: ['./contracts-mobile.component.scss'],
    standalone: true
})
export class ContractsMobileComponent {

  @Input({ required: true }) contracts!: any[];
  @Input() activeMenuId: string | null = null;

  @Output() create = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Contract>();
  @Output() delete = new EventEmitter<string>();
  @Output() showDetails = new EventEmitter<Contract>();
  @Output() closeActionMenu = new EventEmitter<void>();

  @Output() statusFilterChange = new EventEmitter<string>();
  @Output() daysFilterChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();

  @Output() showCustomer = new EventEmitter<string>();
  @Output() showMeter = new EventEmitter<string>();
  @Output() showSupplier = new EventEmitter<string>();
  @Output() toggleActionMenu = new EventEmitter<string>();
  statusFilter = '';
  daysFilter = '';
  searchTerm = '';
  emitActionMenuId(id: any) {
    this.toggleActionMenu.emit(id);
  }

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

    getStatusLabel(status: string): string {
    return this.contractState.find(cs => cs.key == status)?.value || status;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value;
    this.searchChange.emit(value);
  }
}
