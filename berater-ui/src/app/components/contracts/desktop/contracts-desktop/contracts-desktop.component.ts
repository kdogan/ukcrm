import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableContainerComponent } from "src/app/components/shared/tablecontainer.component";
import { FormsModule, NgModel } from '@angular/forms';
import { Contract, ContractState, stateToLabel } from 'src/app/models/contract.model';
import { SearchInputComponent } from 'src/app/components/shared/search-input.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-contracts-desktop',
    standalone: true,
    imports: [CommonModule, TableContainerComponent, FormsModule, SearchInputComponent, TranslateModule],
    templateUrl: './contracts-desktop.component.html',
    styleUrls: ['./contracts-desktop.component.scss']
})
export class ContractsDesktopComponent {


  @Input({ required: true }) contracts!: any[];
  @Input() activeMenuId: string | null = null;

  // Pagination Inputs
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Input() totalPages = 0;

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

  // Pagination Outputs
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

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

  // Pagination Methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
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
}
