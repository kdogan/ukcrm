import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Contract } from '../models/contract.model';

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

  deleteContract(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // File Upload Methods
  uploadAttachment(contractId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${contractId}/attachments`, formData);
  }

  deleteAttachment(contractId: string, attachmentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${contractId}/attachments/${attachmentId}`);
  }

  downloadAttachment(contractId: string, attachmentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${contractId}/attachments/${attachmentId}`, {
      responseType: 'blob'
    });
  }

  getAttachmentUrl(contractId: string, attachmentId: string): string {
    return `${this.apiUrl}/${contractId}/attachments/${attachmentId}`;
  }
}
