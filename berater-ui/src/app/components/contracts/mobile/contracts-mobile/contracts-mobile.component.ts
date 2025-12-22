import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contract } from 'src/app/services/contract.service';

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

    getStatusLabel(status: string): string {
    const labels: any = {
      active: 'Aktiv',
      ended: 'Beendet',
      archived: 'Archiviert'
    };
    return labels[status] || status;
  }
}
