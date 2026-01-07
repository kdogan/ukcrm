import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AddressSuggestion {
  displayName: string;
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  country: string;
}

interface ApiResponse {
  success: boolean;
  data: AddressSuggestion[];
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private readonly apiUrl = `${environment.apiUrl}/geocoding`;

  constructor(private http: HttpClient) {}

  searchAddress(query: string): Observable<AddressSuggestion[]> {
    if (!query || query.length < 3) {
      return of([]);
    }

    return this.http.get<ApiResponse>(`${this.apiUrl}/search`, {
      params: { q: query }
    }).pipe(
      map(response => response.success ? response.data : []),
      catchError(error => {
        console.error('Geocoding error:', error);
        return of([]);
      })
    );
  }

  // Debounced search für bessere Performance
  createSearchObservable(searchSubject: Subject<string>): Observable<AddressSuggestion[]> {
    return searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.searchAddress(query))
    );
  }
}
