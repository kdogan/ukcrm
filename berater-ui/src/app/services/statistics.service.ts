import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContractStatisticsDataset {
  status: string;
  label: string;
  data: number[];
}

export interface ContractStatisticsChartData {
  labels: string[];
  datasets: ContractStatisticsDataset[];
}

export interface StatisticsSupplier {
  _id: string;
  name: string;
  shortName?: string;
}

export interface ContractStatisticsData {
  chartData: ContractStatisticsChartData;
  totalStats: {
    draft: number;
    active: number;
    ended: number;
    archived: number;
    total: number;
  };
  periodStats: {
    draft: number;
    active: number;
    ended: number;
    archived: number;
    total: number;
  };
  months: number;
  statusLabels: {
    draft: string;
    active: string;
    ended: string;
    archived: string;
  };
  suppliers: StatisticsSupplier[];
  selectedSupplierId: string;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = `${environment.apiUrl}/statistics`;

  constructor(private http: HttpClient) {}

  getContractStatistics(months: number = 6, supplierId: string = 'all'): Observable<{ success: boolean; data: ContractStatisticsData }> {
    let url = `${this.apiUrl}/contracts?months=${months}`;
    if (supplierId && supplierId !== 'all') {
      url += `&supplierId=${supplierId}`;
    }
    return this.http.get<{ success: boolean; data: ContractStatisticsData }>(url);
  }
}
