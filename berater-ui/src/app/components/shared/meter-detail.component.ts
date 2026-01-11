import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Util } from '../util/util';

export interface MeterContract {
  _id: string;
  contractNumber: string;
  status: string;
  customerId?: {
    firstName: string;
    lastName: string;
  };
  supplierId?: {
    name: string;
  };
}

export interface MeterForDetail {
  _id: string;
  meterNumber: string;
  maloId?: string;
  type: string;
  isTwoTariff?: boolean;
  currentReading?: number;
  currentReadingHT?: number;
  currentReadingNT?: number;
  location?: {
    street?: string;
    zip?: string;
    city?: string;
  };
  currentCustomerId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

@Component({
  selector: 'app-meter-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="meter-detail">
      <div class="detail-row">
        <span class="detail-label">{{ 'METERS.FIELDS.METER_NUMBER' | translate }}:</span>
        <span class="detail-value">{{ meter?.meterNumber }}</span>
      </div>

      @if(meter?.maloId){
        <div class="detail-row">
          <span class="detail-label">Malo Id:</span>
          <span class="detail-value">{{ meter?.maloId }}</span>
        </div>
      }

      <div class="detail-row">
        <span class="detail-label">{{ 'METERS.FIELDS.TYPE' | translate }}:</span>
        <span class="detail-value">
          <span class="badge">{{ 'METERS.TYPES.' + getTypeTranslationKey(meter?.type) | translate }}</span>
        </span>
      </div>

      <div class="detail-row">
        <span class="detail-label">{{ 'COMMON.STATUS' | translate }}:</span>
        <span class="detail-value">
          <span class="badge" [class.badge-active]="!meter?.currentCustomerId" [class.badge-inactive]="meter?.currentCustomerId">
            {{ meter?.currentCustomerId ? ('METERS.STATUS.OCCUPIED' | translate) : ('METERS.STATUS.FREE' | translate) }}
          </span>
        </span>
      </div>

      @if(meter?.currentCustomerId){
        <div class="detail-row">
          <span class="detail-label">{{ 'METERS.FIELDS.CUSTOMER' | translate }}:</span>
          <span class="detail-value">
            <span class="customer-link" (click)="customerClick.emit(meter?.currentCustomerId)">
              {{ meter?.currentCustomerId?.firstName }} {{ meter?.currentCustomerId?.lastName }}
            </span>
          </span>
        </div>
      }

      @if(meter?.location?.street || meter?.location?.city){
        <div class="detail-row">
          <span class="detail-label">{{ 'CUSTOMERS.FIELDS.ADDRESS' | translate }}:</span>
          <span class="detail-value">
            @if(meter?.location?.street){
              <span>{{ meter?.location?.street }}<br></span>
            }
            @if(meter?.location?.zip || meter?.location?.city){
              <span>{{ meter?.location?.zip }} {{ meter?.location?.city }}</span>
            }
          </span>
        </div>
      }

      <!-- Aktueller Zählerstand -->
      @if(meter?.currentReading || meter?.currentReadingHT || meter?.currentReadingNT){
        <div class="detail-row">
          <span class="detail-label">{{ 'METERS.FIELDS.READING' | translate }}:</span>
          <span class="detail-value">
            @if(meter?.isTwoTariff){
              <div class="two-tariff-reading">
                <strong>HT:</strong> {{ meter?.currentReadingHT || '-' }} {{ meter?.currentReadingHT ? getMeterUnit(meter?.type) : '' }}<br>
                <strong>NT:</strong> {{ meter?.currentReadingNT || '-' }} {{ meter?.currentReadingNT ? getMeterUnit(meter?.type) : '' }}
              </div>
            }@else{
              <strong>{{ meter?.currentReading || '-' }} {{ meter?.currentReading ? getMeterUnit(meter?.type) : '' }}</strong>
            }
          </span>
        </div>
      }

      <!-- Vertragsliste -->
      @if(showContracts){
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
                <th>{{ 'METERS.FIELDS.CUSTOMER' | translate }}</th>
                <th>{{ 'CONTRACTS.FIELDS.SUPPLIER' | translate }}</th>
                <th>{{ 'CONTRACTS.FIELDS.STATUS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for(contract of contracts; track contract._id){
                <tr class="clickable-row" (click)="contractClick.emit(contract)">
                  <td>{{ contract.contractNumber }}</td>
                  <td>{{ contract.customerId?.firstName }} {{ contract.customerId?.lastName }}</td>
                  <td>{{ contract.supplierId?.name || '-' }}</td>
                  <td>
                    <span class="badge"
                          [class.badge-active]="contract.status === 'active'"
                          [class.badge-inactive]="contract.status === 'ended' || contract.status === 'archived'">
                      {{ 'CONTRACTS.STATUS.' + (contract.status | uppercase) | translate }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      }
    </div>
  `,
  styles: [`
    .meter-detail {
      padding: 0;
    }

    .detail-row {
      display: flex;
      padding: 0.5rem 0;
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

    .customer-link {
      color: #3498db;
      cursor: pointer;
      text-decoration: underline;
    }

    .customer-link:hover {
      color: #2980b9;
    }

    .two-tariff-reading {
      font-size: 0.9rem;
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
      background: #e3f2fd;
      color: #1565c0;
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
export class MeterDetailComponent {
  @Input() meter: MeterForDetail | null = null;
  @Input() contracts: MeterContract[] = [];
  @Input() showContracts: boolean = true;

  @Output() contractClick = new EventEmitter<MeterContract>();
  @Output() customerClick = new EventEmitter<any>();

  getTypeTranslationKey(type: string | undefined): string {
    if (!type) return 'ELECTRICITY';
    // Convert meter type to translation key
    // electricity -> ELECTRICITY, gas -> GAS, heatpump -> HEAT_PUMP, nightstorage -> NIGHT_STORAGE
    const typeMap: { [key: string]: string } = {
      'electricity': 'ELECTRICITY',
      'gas': 'GAS',
      'water': 'WATER',
      'heatpump': 'HEAT_PUMP',
      'nightstorage': 'NIGHT_STORAGE'
    };
    return typeMap[type.toLowerCase()] || type.toUpperCase();
  }

  getMeterUnit(type: string | undefined): string {
    if (!type) return '';
    return Util.getMeterUnit(type);
  }
}
