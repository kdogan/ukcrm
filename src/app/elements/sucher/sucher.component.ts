import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sucher',
  templateUrl: './sucher.component.html',
  styleUrl: './sucher.component.scss'
})
export class SucherComponent {
searchTerm: string = '';
  @Output() search = new EventEmitter<string>();

  searchContracts() {
    this.search.emit(this.searchTerm);
  }
}
