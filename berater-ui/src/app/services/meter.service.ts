import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Meter {
  _id: string;
  meterNumber: string;
  type: 'electricity' | 'gas' | 'water';
  currentCustomerId?: any;
  location?: string;
  installationDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MeterService {
  private apiUrl = `${environment.apiUrl}/meters`;

  constructor(private http: HttpClient) {}

  getMeters(filters: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  } = {}): Observable<any> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get(this.apiUrl, { params });
  }

  getMeter(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createMeter(meter: Partial<Meter>): Observable<any> {
    return this.http.post(this.apiUrl, meter);
  }

  updateMeter(id: string, meter: Partial<Meter>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, meter);
  }

  deleteMeter(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  assignCustomer(meterId: string, customerId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${meterId}/assign`, { customerId });
  }

  releaseMeter(meterId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${meterId}/release`, {});
  }

  getMeterHistory(meterId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${meterId}/history`);
  }
}
