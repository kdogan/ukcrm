import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Supplier } from '../../../services/supplier.service';

@Component({
    selector: 'app-suppliers-mobile',
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './suppliers-mobile.component.html',
    styleUrl: './suppliers-mobile.component.scss'
})
export class SuppliersMobileComponent {
  @Input() suppliers: Supplier[] = [];
  @Input() filterActive?: boolean = undefined;

  @Output() create = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Supplier>();
  @Output() delete = new EventEmitter<string>();
  @Output() filterActiveChange = new EventEmitter<boolean | undefined>();
}
