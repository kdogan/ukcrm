import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
}
