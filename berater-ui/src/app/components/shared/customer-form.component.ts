import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AddressAutocompleteComponent, AddressData } from './address-autocomplete.component';

export interface CustomerFormData {
  _id?: string;
  anrede?: 'Herr' | 'Frau';
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  notes?: string;
  address?: {
    street?: string;
    zip?: string;
    city?: string;
  };
  isActive?: boolean;
}

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AddressAutocompleteComponent],
  template: `
    <form (ngSubmit)="onSubmit()" #customerForm="ngForm">
      <!-- Anrede (optional, nur wenn showSalutation true ist) -->
      @if(showSalutation) {
        <div class="form-group">
          <label>{{ 'CUSTOMERS.FIELDS.SALUTATION' | translate }}</label>
          <select [(ngModel)]="customer.anrede" name="anrede">
            <option [ngValue]="undefined">{{ 'COMMON.SELECT' | translate }}</option>
            <option value="Herr">{{ 'CUSTOMERS.FIELDS.MR' | translate }}</option>
            <option value="Frau">{{ 'CUSTOMERS.FIELDS.MRS' | translate }}</option>
          </select>
        </div>
      }

      <div class="form-row">
        <div class="form-group">
          <label>{{ 'CUSTOMERS.FIELDS.FIRST_NAME' | translate }} *</label>
          <input type="text" [(ngModel)]="customer.firstName" name="firstName" required class="form-control" />
        </div>
        <div class="form-group">
          <label>{{ 'CUSTOMERS.FIELDS.LAST_NAME' | translate }} *</label>
          <input type="text" [(ngModel)]="customer.lastName" name="lastName" required class="form-control" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>{{ 'COMMON.EMAIL' | translate }}</label>
          <input type="email" [(ngModel)]="customer.email" name="email" class="form-control" />
        </div>
        <div class="form-group">
          <label>{{ 'COMMON.PHONE' | translate }}</label>
          <input type="tel" [(ngModel)]="customer.phone" name="phone" class="form-control" />
        </div>
      </div>

      <div class="form-group">
        <label>{{ 'COMMON.NOTES' | translate }}</label>
        <textarea [(ngModel)]="customer.notes" name="notes" rows="3" class="form-control"></textarea>
      </div>

      <!-- Adresse optional mit Checkbox -->
      @if(showAddressToggle) {
        <div class="form-group">
          <div class="checkbox-wrapper">
            <input
              type="checkbox"
              id="showAddress"
              [(ngModel)]="showAddressFields"
              [ngModelOptions]="{standalone: true}"
              class="checkbox-input" />
            <label for="showAddress" class="checkbox-label">{{ 'CUSTOMERS.WANT_ADDRESS' | translate }}</label>
          </div>
        </div>

        @if(showAddressFields) {
          <app-address-autocomplete
            [address]="addressData"
            (addressChange)="onAddressChange($event)"
          />
        }
      }

      @if(!showAddressToggle && showAddress) {
        <div class="form-group">
          <label>{{ 'CUSTOMERS.FIELDS.ADDRESS' | translate }}</label>
          <app-address-autocomplete
            [address]="addressData"
            (addressChange)="onAddressChange($event)"
          />
        </div>
      }

      <div class="modal-footer">
        <button type="button" class="btn-secondary" (click)="onCancel()">{{ 'COMMON.CANCEL' | translate }}</button>
        <button type="submit" class="btn-primary" [disabled]="!customerForm.form.valid || saving">
          @if(saving) {
            <i class="fas fa-spinner fa-spin"></i>
          }
          {{ isEditMode ? ('COMMON.SAVE' | translate) : ('COMMON.CREATE' | translate) }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary-color, #3b82f6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color, #e2e8f0);
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary-color, #3b82f6);
      color: white;
      border: none;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-hover, #2563eb);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      color: var(--text-primary);
      border: 1px solid var(--border-color, #e2e8f0);
    }

    .btn-secondary:hover {
      background: var(--bg-hover, #f1f5f9);
    }

    .checkbox-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .checkbox-input {
      width: 18px !important;
      height: 18px;
      cursor: pointer;
      accent-color: var(--primary-color, #3b82f6);
    }

    .checkbox-label {
      cursor: pointer;
      user-select: none;
      font-weight: normal;
      margin-bottom: 0;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CustomerFormComponent implements OnInit {
  @Input() customer: CustomerFormData = this.getEmptyCustomer();
  @Input() isEditMode = false;
  @Input() saving = false;
  @Input() showSalutation = true;
  @Input() showAddress = true;
  @Input() showAddressToggle = false; // Wenn true, zeigt eine Checkbox um Adresse ein/auszublenden

  @Output() save = new EventEmitter<CustomerFormData>();
  @Output() cancel = new EventEmitter<void>();

  showAddressFields = false;

  ngOnInit(): void {
    // Wenn Adresse vorhanden, zeige die Felder
    if (this.customer.address?.street || this.customer.address?.zip || this.customer.address?.city) {
      this.showAddressFields = true;
    }

    // Stelle sicher, dass address-Objekt existiert
    if (!this.customer.address) {
      this.customer.address = { street: '', zip: '', city: '' };
    }
  }

  getEmptyCustomer(): CustomerFormData {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notes: '',
      address: {
        street: '',
        zip: '',
        city: ''
      }
    };
  }

  get addressData(): AddressData {
    return {
      street: this.customer.address?.street || '',
      zipCode: this.customer.address?.zip || '',
      city: this.customer.address?.city || ''
    };
  }

  onAddressChange(address: AddressData): void {
    if (!this.customer.address) {
      this.customer.address = {};
    }
    this.customer.address.street = address.street;
    this.customer.address.zip = address.zipCode;
    this.customer.address.city = address.city;
  }

  onSubmit(): void {
    this.save.emit(this.customer);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
