import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contract } from 'src/app/services/contract.service';
import { ContractState, stateToLabel } from 'src/app/models/contract.model';

@Component({
  selector: 'app-contracts-mobile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contracts-mobile.component.html',
  styleUrls: ['./contracts-mobile.component.scss']
})
export class ContractsMobileComponent {

  @Input({ required: true }) contracts!: any[];
  @Output() create = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Contract>();
  @Output() delete = new EventEmitter<string>();
  @Output() closeActionMenu = new EventEmitter<void>();

  @Output() statusFilterChange = new EventEmitter<string>();
  @Output() daysFilterChange = new EventEmitter<string>();

  @Output() showCustomer = new EventEmitter<string>();
  @Output() showMeter = new EventEmitter<string>();
  @Output() showSupplier = new EventEmitter<string>();
  @Output() toggleActionMenu = new EventEmitter<string>();

  activeMenuId: string | null = null;
    statusFilter = '';
  daysFilter = '';
  emitActionMenuId(id: any) {
    this.activeMenuId = id;
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
}
