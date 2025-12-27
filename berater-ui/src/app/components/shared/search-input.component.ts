import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-wrapper">
      <i class="fas fa-search search-icon"></i>
      <input
        type="search"
        class="search-input"
        [placeholder]="placeholder"
        [(ngModel)]="searchValue"
        (ngModelChange)="onSearchChange()"
      />
      <button
        *ngIf="searchValue"
        class="clear-btn"
        (click)="clearSearch()"
        type="button"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  `,
  styles: [`
    .search-wrapper {
      position: relative;
      flex: 1;
      max-width: 400px;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      color: #999;
      font-size: 1rem;
      pointer-events: none;
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 2.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s;
      background: #fff;
    }

    .search-input:focus {
      outline: none;
      border-color: #34d399;
      box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
    }

    .search-input::placeholder {
      color: #999;
    }

    .clear-btn {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      transition: all 0.2s;
    }

    .clear-btn:hover {
      background: #f5f5f5;
      color: #333;
    }

    .clear-btn i {
      font-size: 0.875rem;
    }
  `]
})
export class SearchInputComponent {
  @Input() placeholder: string = 'Suchen...';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  searchValue: string = '';

  ngOnInit() {
    this.searchValue = this.value;
  }

  ngOnChanges() {
    this.searchValue = this.value;
  }

  onSearchChange() {
    this.valueChange.emit(this.searchValue);
  }

  clearSearch() {
    this.searchValue = '';
    this.valueChange.emit('');
  }
}
