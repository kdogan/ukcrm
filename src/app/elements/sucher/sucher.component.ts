import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sucher',
  template: `<div class="search-container">
                <input type="text" [(ngModel)]="searchTerm" (keyup)="searchContracts()" placeholder="Verträge suchen...">
                <i class="fa fa-search search-icon"></i>
            </div>`,
  styleUrl: './sucher.component.scss'
})
export class SucherComponent {
searchTerm: string = '';
  @Output() search = new EventEmitter<string>();

  searchContracts() {
    this.search.emit(this.searchTerm);
  }
}
