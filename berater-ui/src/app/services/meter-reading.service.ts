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

export interface YearlyEstimateSingle {
  year: number;
  hasEstimate: true;
  type: 'single';
  firstReading: { date: Date; value: number };
  lastReading: { date: Date; value: number };
  actualConsumption: number;
  daysBetween: number;
  dailyConsumption: number;
  yearlyEstimate: number;
  readingCount: number;
}

export interface YearlyEstimateTwoTariff {
  year: number;
  hasEstimate: true;
  type: 'twoTariff';
  firstReading: { date: Date; valueHT: number; valueNT?: number };
  lastReading: { date: Date; valueHT: number; valueNT?: number };
  actualConsumptionHT: number;
  actualConsumptionNT: number | null;
  actualConsumptionTotal: number;
  daysBetween: number;
  dailyConsumptionHT: number;
  dailyConsumptionNT: number | null;
  yearlyEstimateHT: number;
  yearlyEstimateNT: number | null;
  yearlyEstimateTotal: number;
  readingCount: number;
}

export interface YearlyEstimateNoData {
  year: number;
  hasEstimate: false;
  message: string;
  readingCount: number;
}

export type YearlyEstimate = YearlyEstimateSingle | YearlyEstimateTwoTariff | YearlyEstimateNoData;

export interface YearlyConsumptionResponse {
  meterId: string;
  meterNumber: string;
  meterType: string;
  isTwoTariff: boolean;
  yearlyEstimates: YearlyEstimate[];
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

  getYearlyEstimates(meterId: string): Observable<{ success: boolean; data: YearlyConsumptionResponse }> {
    return this.http.get<{ success: boolean; data: YearlyConsumptionResponse }>(
      `${this.apiUrl}/${meterId}/readings/yearly-estimates`
    );
  }
}
