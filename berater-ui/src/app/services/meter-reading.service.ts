import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MeterReading {
  _id: string;
  meterId: string;
  beraterId: string;
  customerId?: string;
  contractId?: string;
  readingValue?: number; // Für Ein-Tarif-Zähler
  readingValueHT?: number; // Hochtarif (für Zwei-Tarif-Zähler)
  readingValueNT?: number; // Niedrigtarif (für Zwei-Tarif-Zähler)
  readingDate: Date;
  readingType: 'initial' | 'regular' | 'final' | 'special';
  notes?: string;
  imageUrl?: string;
  consumption?: number;
  daysSinceLastReading?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReadingDto {
  readingValue?: number; // Für Ein-Tarif-Zähler
  readingValueHT?: number; // Hochtarif (für Zwei-Tarif-Zähler)
  readingValueNT?: number; // Niedrigtarif (für Zwei-Tarif-Zähler)
  readingDate?: Date;
  readingType?: 'initial' | 'regular' | 'final' | 'special';
  notes?: string;
  imageUrl?: string;
  contractId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MeterReadingService {
  private apiUrl = `${environment.apiUrl}/meters`;

  constructor(private http: HttpClient) {}

  getMeterReadings(meterId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${meterId}/readings`);
  }

  getLatestReading(meterId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${meterId}/readings/latest`);
  }

  createReading(meterId: string, data: CreateReadingDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${meterId}/readings`, data);
  }

  deleteReading(meterId: string, readingId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${meterId}/readings/${readingId}`);
  }
}
