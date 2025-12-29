import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer } from 'src/app/services/customer.service';

@Component({
    selector: 'app-customers-mobile',
    imports: [CommonModule, FormsModule],
    templateUrl: './customers-mobile.component.html',
    styleUrl: './customers-mobile.component.scss',
    standalone:true
})
export class CustomersMobileComponent {

  @Input({ required: true }) customers!: any[];
  @Output() create = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Customer>();
  @Output() delete = new EventEmitter<string>();
  @Output() showDetails = new EventEmitter<Customer>();
  @Output() filterActiveChange = new EventEmitter<boolean>();
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() closeActionMenu = new EventEmitter<void>();
  @Output() toggleActionMenu = new EventEmitter<string>();

  searchTerm = '';
  filterActive?: boolean = undefined;

}
