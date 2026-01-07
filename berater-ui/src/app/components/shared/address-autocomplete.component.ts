import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { GeocodingService, AddressSuggestion } from '../../services/geocoding.service';

export interface AddressData {
  street: string;
  zipCode: string;
  city: string;
}

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="address-autocomplete">
      <!-- Autocomplete Suchfeld -->
      <div class="search-section">
        <div class="search-header">
          <i class="fas fa-search"></i>
          <span>{{ 'CUSTOMERS.ADDRESS_SEARCH' | translate }}</span>
        </div>
        <div class="form-group autocomplete-group">
          <input type="text"
               [(ngModel)]="searchQuery"
               (input)="onSearchInput()"
               (focus)="showSuggestions = true"
               (blur)="closeSuggestionsDelayed()"
               [placeholder]="'CUSTOMERS.ADDRESS_SEARCH_PLACEHOLDER' | translate"
               class="form-control"
               autocomplete="off" />
        <div class="suggestions-list" *ngIf="showSuggestions && suggestions.length > 0">
          <div class="suggestion-item"
               *ngFor="let suggestion of suggestions"
               (mousedown)="selectSuggestion(suggestion); $event.preventDefault()">
            <span class="suggestion-main">{{ suggestion.street }}, {{ suggestion.zipCode }} {{ suggestion.city }}</span>
          </div>
        </div>
        <div class="suggestions-list" *ngIf="showSuggestions && isSearching">
          <div class="suggestion-item loading">
            {{ 'COMMON.LOADING' | translate }}...
          </div>
        </div>
        </div>
      </div>

      <!-- Oder manuell eingeben -->
      <div class="manual-divider">
        <span>{{ 'COMMON.OR' | translate }}</span>
      </div>

      <!-- Manuelle Eingabefelder -->
      <div class="manual-fields">
        <div class="form-group">
          <label>{{ 'CUSTOMERS.FIELDS.STREET' | translate }}</label>
          <input type="text"
                 [(ngModel)]="address.street"
                 (ngModelChange)="onManualChange()"
                 [placeholder]="'CUSTOMERS.FIELDS.STREET' | translate"
                 class="form-control" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ 'CUSTOMERS.FIELDS.ZIP' | translate }}</label>
            <input type="text"
                   [(ngModel)]="address.zipCode"
                   (ngModelChange)="onManualChange()"
                   [placeholder]="'CUSTOMERS.FIELDS.ZIP' | translate"
                   class="form-control" />
          </div>
          <div class="form-group">
            <label>{{ 'CUSTOMERS.FIELDS.CITY' | translate }}</label>
            <input type="text"
                   [(ngModel)]="address.city"
                   (ngModelChange)="onManualChange()"
                   [placeholder]="'CUSTOMERS.FIELDS.CITY' | translate"
                   class="form-control" />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .address-autocomplete {
      margin-bottom: 1rem;
    }

    .search-section {
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      border: 2px solid #4caf50;
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 0.5rem;
    }

    .search-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      color: #2e7d32;
      font-weight: 600;
      font-size: 0.95rem;

      i {
        font-size: 1rem;
      }
    }

    .autocomplete-group {
      position: relative;
    }

    .search-section .form-control {
      background: white;
      border-color: #81c784;

      &:focus {
        border-color: #4caf50;
        box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
      }
    }

    .suggestions-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      max-height: 200px;
      overflow-y: auto;
      border: 2px solid var(--primary-color);
      border-radius: 8px;
      background: var(--white);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 2000;
    }

    .suggestion-item {
      padding: 0.75rem;
      cursor: pointer;
      border-bottom: 1px solid var(--border-subtle);
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--bg-gray);
      }

      &:last-child {
        border-bottom: none;
      }

      &.loading {
        color: var(--text-tertiary);
        font-style: italic;
        cursor: default;
      }
    }

    .suggestion-main {
      font-weight: 500;
    }

    .manual-divider {
      display: flex;
      align-items: center;
      margin: 1.5rem 0;
      color: var(--text-tertiary);

      &::before,
      &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--border-light);
      }

      span {
        padding: 0 1rem;
        font-size: 0.875rem;
        text-transform: uppercase;
      }
    }

    .manual-fields {
      .form-group {
        margin-bottom: 1rem;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 1rem;
      }
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid var(--border-light);
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: var(--primary-color);
      }
    }
  `]
})
export class AddressAutocompleteComponent implements OnInit, OnDestroy {
  @Input() address: AddressData = { street: '', zipCode: '', city: '' };
  @Output() addressChange = new EventEmitter<AddressData>();

  searchQuery = '';
  suggestions: AddressSuggestion[] = [];
  showSuggestions = false;
  isSearching = false;

  private searchSubject = new Subject<string>();
  private subscription?: Subscription;

  constructor(private geocodingService: GeocodingService) {}

  ngOnInit(): void {
    this.subscription = this.geocodingService.createSearchObservable(this.searchSubject)
      .subscribe(results => {
        this.suggestions = results;
        this.isSearching = false;
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onSearchInput(): void {
    if (this.searchQuery.length >= 3) {
      this.isSearching = true;
      this.searchSubject.next(this.searchQuery);
    } else {
      this.suggestions = [];
      this.isSearching = false;
    }
  }

  selectSuggestion(suggestion: AddressSuggestion): void {
    this.address.street = suggestion.street;
    this.address.zipCode = suggestion.zipCode;
    this.address.city = suggestion.city;
    this.searchQuery = `${suggestion.street}, ${suggestion.zipCode} ${suggestion.city}`;
    this.showSuggestions = false;
    this.suggestions = [];
    this.addressChange.emit(this.address);
  }

  onManualChange(): void {
    this.addressChange.emit(this.address);
  }

  closeSuggestionsDelayed(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }
}
