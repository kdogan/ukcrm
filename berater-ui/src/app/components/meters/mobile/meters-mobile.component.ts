import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Util } from '../../util/util';
import { Meter } from 'src/app/models/meter.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-meters-mobile',
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './meters-mobile.component.html',
    styleUrl: './meters-mobile.component.scss'
})
export class MetersMobileComponent {


  @Input({ required: true }) meters!: Meter[];
  @Input() meterTypes!: string[];
  @Output() create = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Meter>();
  @Output() delete = new EventEmitter<string>();
  @Output() showDetails = new EventEmitter<Meter>();
  @Output() filterStatusChange = new EventEmitter<string>();
  @Output() filterTypeChange = new EventEmitter<string>();
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() closeActionMenu = new EventEmitter<void>();
  @Output() toggleActionMenu = new EventEmitter<string>();
  @Output() addReading = new EventEmitter<Meter>();
  @Output() viewReadings = new EventEmitter<Meter>();
  @Output() showYearlyEstimates = new EventEmitter<Meter>();
  @Output() showCustomerDetails = new EventEmitter<any>();
  @Output() createContract = new EventEmitter<Meter>();

  searchTerm = '';
  statusFilterTerm = "";
  typeFilterTerm = "";

  getTypeLabel(type: string): string {
    return Util.getMeterTypeLabel(type);
  }
  getMeterTypeWithLabel(){
    return Util.getMeterTypeWithLabel();
  }
  getMeterUnit(type: string): string {
    return Util.getMeterUnit(type);
  }
}

