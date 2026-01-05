import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer } from '../../services/customer.service';
import { TranslateModule } from '@ngx-translate/core';

export interface CustomerContract {
  _id: string;
  contractNumber: string;
  status: string;
  supplierId?: {
    name: string;
  };
}

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="customer-detail">
      <!-- <div class="detail-row" *ngIf="customer?.customerNumber">
        <span class="detail-label">Kundennummer:</span>
        <span class="detail-value">{{ customer?.customerNumber }}</span>
      </div> -->

      <div class="detail-row">
        <span class="detail-label">{{ 'COMMON.NAME' | translate }}:</span>
        <span class="detail-value">{{ customer?.firstName }} {{ customer?.lastName }}</span>
      </div>
      @if(customer?.anrede){
        <div class="detail-row">
          <span class="detail-label">{{ 'CUSTOMERS.FIELDS.SALUTATION' | translate }}:</span>
          <span class="detail-value">{{ customer?.anrede }}</span>
        </div>
      }
      @if(customer?.email){
        <div class="detail-row">
          <span class="detail-label">{{ 'CUSTOMERS.FIELDS.EMAIL' | translate }}:</span>
          <span class="detail-value">{{ customer?.email }}</span>
        </div>
      }
      @if(customer?.phone){
        <div class="detail-row">
          <span class="detail-label">{{ 'CUSTOMERS.FIELDS.PHONE' | translate }}:</span>
          <span class="detail-value">
            {{ customer?.phone }}
            <a [href]="'tel:' + customer?.phone" class="phone-link" title="Anrufen">📞</a>
          </span>
        </div>
      }
      @if(customer?.address?.street || customer?.address?.city){
        <div class="detail-row">
          <span class="detail-label">{{ 'CUSTOMERS.FIELDS.ADDRESS' | translate }}:</span>
          <span class="detail-value">
            @if(customer?.address?.street){
              <span>{{ customer?.address?.street }}<br></span>
            }
            @if(customer?.address?.zip || customer?.address?.city){
              <span>{{ customer?.address?.zip }} {{ customer?.address?.city }}</span>
            }
          </span>
        </div>
      }
      @if(customer?.notes){
        <div class="detail-row">
          <span class="detail-label">{{ 'CUSTOMERS.FIELDS.NOTES' | translate }}:</span>
          <span class="detail-value">{{ customer?.notes }}</span>
        </div>
      }
      <!-- Vertragsverlauf -->
       @if(showContracts){
        <ng-container>
          <hr class="section-divider" />
          <h3 class="section-title">{{ 'CONTRACTS.CONTRACTS_LIST' | translate }}</h3>
          @if(contracts.length === 0){
            <div class="no-data">{{ 'CONTRACTS.NO_CONTRACTS' | translate }}</div>
          }
          @if(contracts.length > 0){
          <table class="contracts-table">
            <thead>
              <tr>
                <th>{{ 'CONTRACTS.FIELDS.CONTRACT_NUMBER' | translate }}</th>
                <th>{{ 'CONTRACTS.FIELDS.SUPPLIER' | translate }}</th>
                <th>{{ 'CONTRACTS.FIELDS.STATUS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for(contract of contracts; track contract){
              <tr class="clickable-row" (click)="contractClick.emit(contract)">
                <td>{{ contract.contractNumber }}</td>
                <td>{{ contract.supplierId?.name || '-' }}</td>
                <td>
                  <span class="badge"
                        [class.badge-active]="contract.status === 'active'"
                        [class.badge-inactive]="contract.status === 'ended' || contract.status === 'archived'">
                    {{ getStatusLabel(contract.status) }}
                  </span>
                </td>
              </tr>
            }
            </tbody>
          </table>
        }
        </ng-container>
      }
    </div>
  `,
  styles: [`
    .customer-detail {
      padding: 0.5rem 0;
    }

    .detail-row {
      display: flex;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 600;
      color: #6c757d;
      min-width: 150px;
      flex-shrink: 0;
    }

    .detail-value {
      color: #2c3e50;
      flex: 1;
    }

    .phone-link {
      margin-left: 0.5rem;
      font-size: 1.1rem;
      text-decoration: none;
      transition: transform 0.2s;
      display: inline-block;
    }

    .phone-link:hover {
      transform: scale(1.2);
    }

    .section-divider {
      margin: 1.5rem 0;
      border: none;
      border-top: 1px solid #e0e0e0;
    }

    .section-title {
      margin-bottom: 1rem;
      font-size: 1.1rem;
      color: #2c3e50;
    }

    .no-data {
      text-align: center;
      padding: 1.5rem;
      color: #6c757d;
      font-style: italic;
    }

    .contracts-table {
      width: 100%;
      border-collapse: collapse;
    }

    .contracts-table th,
    .contracts-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
    }

    .contracts-table th {
      font-weight: 600;
      color: #6c757d;
      background: #f8f9fa;
    }

    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .clickable-row:hover {
      background-color: #f8f9ff;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      background: #ffebee;
      color: #c62828;
    }

    .badge-active {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .badge-inactive {
      background: #ffebee;
      color: #c62828;
    }
  `]
})
export class CustomerDetailComponent {
  @Input() customer: Customer | null = null;
  @Input() contracts: CustomerContract[] = [];
  @Input() showContracts: boolean = true;

  @Output() contractClick = new EventEmitter<CustomerContract>();

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'draft': 'Entwurf',
      'active': 'Aktiv',
      'ended': 'Beendet',
      'archived': 'Archiviert'
    };
    return statusLabels[status] || status;
  }
}
