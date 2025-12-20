import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Contract {
  _id: string;
  contractNumber: string;
  customerId: any;
  meterId: any;
  supplierId: any;
  startDate: Date;
  endDate: Date;
  durationMonths: number;
  status: 'active' | 'ended' | 'archived';
  notes?: string;
  daysRemaining?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private apiUrl = `${environment.apiUrl}/contracts`;

  constructor(private http: HttpClient) {}

  getContracts(filters: {
    status?: string;
    supplierId?: string;
    daysRemaining?: number;
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

  getContract(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createContract(contract: Partial<Contract>): Observable<any> {
    return this.http.post(this.apiUrl, contract);
  }

  updateContract(id: string, contract: Partial<Contract>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, contract);
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteContract(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
