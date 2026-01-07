import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChartData {
  labels: string[];
  contracts: number[];
  customers: number[];
  meters: number[];
}

export interface DashboardStats {
  expiringContracts: any[];
  contractsBySupplier: Array<{
    _id: string;
    name: string;
    shortName: string;
    count: number;
  }>;
  customers: {
    active: number;
    withExpiringContracts: number;
  };
  meters: {
    total: number;
    free: number;
    occupied: number;
  };
  reminders: {
    total: number;
    urgent: number;
  };
  contracts: {
    total: number;
    active: number;
  };
  newCustomers: {
    count: number;
    period: string;
  };
  recentContractsReadings: {
    totalContracts: number;
    withReadings: number;
    withoutReadings: number;
  };
  upgradeRequests?: {
    pending: any[];
    counts: {
      pending: number;
      paymentReceived: number;
      awaitingReview: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<{ success: boolean; data: DashboardStats }> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(`${this.apiUrl}/stats`);
  }

  getCharts(months: number = 6): Observable<{ success: boolean; data: ChartData }> {
    return this.http.get<{ success: boolean; data: ChartData }>(`${this.apiUrl}/charts?months=${months}`);
  }
}
