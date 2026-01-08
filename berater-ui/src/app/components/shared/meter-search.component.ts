import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Meter } from '../../models/meter.model';
import { Util } from '../util/util';

@Component({
  selector: 'app-meter-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="meter-search">
      <div class="search-container" [class.with-add-button]="showAddButton">
        <input type="text"
              [placeholder]="'METERS.SEARCH' | translate"
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              (focus)="onFocus()"
              (blur)="closeSuggestionsDelayed()"
              class="form-control search-input"
              autocomplete="off" />
        @if(showAddButton){
          <button type="button" class="btn-add-inline" (click)="addNew.emit()" [title]="'METERS.NEW' | translate">
            <i class="fas fa-plus"></i>
          </button>
        }
      </div>

      @if(showDropdown && filteredMeters.length > 0){
        <div class="dropdown-list">
          @for(meter of filteredMeters; track meter._id){
            <div class="dropdown-item"
                [class.selected]="selectedMeter?._id === meter._id"
                [class.occupied]="showFreeStatus && !meter.isFree"
                [class.disabled]="showFreeStatus && !meter.isFree"
                (mousedown)="onMeterClick(meter); $event.preventDefault()"
                [style.cursor]="!showFreeStatus || meter.isFree ? 'pointer' : 'not-allowed'">
              <span class="meter-number">{{ meter.meterNumber }}</span>
              <span class="meter-type">({{ getTypeLabel(meter.type) }})</span>
              @if(showFreeStatus && !meter.isFree){
                <span class="meter-status occupied">- {{ 'METERS.STATUS.OCCUPIED' | translate }}</span>
              }
              @if(meter.location?.city){
                <span class="meter-location">{{ formatLocation(meter) }}</span>
              }
            </div>
          }
        </div>
      }

      @if(showDropdown && filteredMeters.length === 0 && searchQuery.length > 0){
        <div class="dropdown-list">
          <div class="dropdown-item no-results">
            {{ 'COMMON.NO_RESULTS' | translate }}
          </div>
        </div>
      }

      @if(selectedMeter){
        <div class="selected-item">
          <span class="selected-text">
            <strong>{{ selectedMeter.meterNumber }}</strong>
            <span class="selected-type">({{ getTypeLabel(selectedMeter.type) }})</span>
            @if(selectedMeter.location?.city){
              <span class="selected-location">- {{ formatLocation(selectedMeter) }}</span>
            }
          </span>
          <button type="button" class="btn-clear" (click)="clearSelection()">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .meter-search {
      position: relative;
    }

    .search-container {
      display: flex;
      gap: 0.5rem;
    }

    .search-container.with-add-button .search-input {
      flex: 1;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-light, #e0e0e0);
      border-radius: 8px;
      font-size: 0.95rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-color, #6366f1);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .btn-add-inline {
      background: var(--primary-color, #6366f1);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .btn-add-inline:hover {
      background: var(--primary-dark, #4f46e5);
    }

    .dropdown-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      max-height: 250px;
      overflow-y: auto;
      background: white;
      border: 1px solid var(--border-light, #e0e0e0);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      margin-top: 4px;
    }

    .dropdown-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 1px solid var(--border-light, #f0f0f0);
      transition: background 0.15s;
    }

    .dropdown-item:last-child {
      border-bottom: none;
    }

    .dropdown-item:hover:not(.disabled) {
      background: var(--bg-hover, #f5f5f5);
    }

    .dropdown-item.selected {
      background: rgba(99, 102, 241, 0.1);
    }

    .dropdown-item.occupied {
      background: rgba(239, 68, 68, 0.05);
    }

    .dropdown-item.disabled {
      opacity: 0.6;
    }

    .dropdown-item.no-results {
      color: var(--text-secondary, #666);
      font-style: italic;
      cursor: default;
    }

    .dropdown-item.no-results:hover {
      background: transparent;
    }

    .meter-number {
      font-weight: 500;
      color: var(--text-primary, #333);
    }

    .meter-type {
      font-size: 0.9rem;
      color: var(--text-secondary, #666);
    }

    .meter-status.occupied {
      font-size: 0.85rem;
      color: #ef4444;
      font-weight: 500;
    }

    .meter-location {
      font-size: 0.85rem;
      color: var(--text-secondary, #888);
      width: 100%;
    }

    .selected-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border: 1px solid #2196f3;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin-top: 0.5rem;
    }

    .selected-text {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .selected-type {
      color: var(--text-secondary, #666);
      font-weight: normal;
    }

    .selected-location {
      color: var(--text-secondary, #666);
      font-size: 0.9rem;
    }

    .btn-clear {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: var(--text-secondary, #888);
      cursor: pointer;
      padding: 0 0.5rem;
      line-height: 1;
      transition: color 0.2s;
    }

    .btn-clear:hover {
      color: #ef4444;
    }
  `]
})
export class MeterSearchComponent {
  @Input() meters: Meter[] = [];
  @Input() selectedMeter: Meter | null = null;
  @Input() showAddButton = false;
  @Input() showFreeStatus = false;

  @Output() meterSelected = new EventEmitter<Meter>();
  @Output() meterCleared = new EventEmitter<void>();
  @Output() addNew = new EventEmitter<void>();

  searchQuery = '';
  showDropdown = false;
  filteredMeters: Meter[] = [];

  onFocus(): void {
    this.showDropdown = true;
    this.filterMeters();
  }

  onSearchInput(): void {
    this.showDropdown = true;
    this.filterMeters();
  }

  filterMeters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredMeters = this.meters.slice(0, 20);
    } else {
      this.filteredMeters = this.meters.filter(meter =>
        meter.meterNumber?.toLowerCase().includes(query) ||
        this.getTypeLabel(meter.type).toLowerCase().includes(query) ||
        meter.location?.city?.toLowerCase().includes(query) ||
        meter.location?.street?.toLowerCase().includes(query)
      ).slice(0, 20);
    }
  }

  onMeterClick(meter: Meter): void {
    if (this.showFreeStatus && !meter.isFree) {
      return;
    }
    this.selectMeter(meter);
  }

  selectMeter(meter: Meter): void {
    this.selectedMeter = meter;
    this.searchQuery = '';
    this.showDropdown = false;
    this.meterSelected.emit(meter);
  }

  clearSelection(): void {
    this.selectedMeter = null;
    this.searchQuery = '';
    this.meterCleared.emit();
  }

  closeSuggestionsDelayed(): void {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  getTypeLabel(type: string): string {
    return Util.getMeterTypeLabel(type);
  }

  formatLocation(meter: Meter): string {
    if (!meter.location) return '';
    const parts: string[] = [];
    if (meter.location.street) parts.push(meter.location.street);
    if (meter.location.zip || meter.location.city) {
      parts.push(`${meter.location.zip || ''} ${meter.location.city || ''}`.trim());
    }
    return parts.join(', ');
  }
}
