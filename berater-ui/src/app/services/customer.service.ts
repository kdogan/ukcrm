import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CacheService } from './cache.service';

export interface Customer {
  _id: string;
  customerNumber: string;
  anrede?: 'Herr' | 'Frau';
  firstName: string;
  lastName: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address: Address;
  dateOfBirth?: Date;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  zip: string;
  city: string;
  country?: string;
}

export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CustomerResponse {
  success: boolean;
  data: Customer;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/customers`;

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  getCustomers(filters: {
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    forceRefresh?: boolean; // Neuer Parameter zum Erzwingen eines Refreshs
  } = {}): Observable<CustomerListResponse> {
    // Wenn keine Filter außer isActive gesetzt sind und kein Force-Refresh, versuche Cache zu nutzen
    const useCache = !filters.search && !filters.page && !filters.limit && !filters.forceRefresh;

    if (useCache) {
      const cachedData = this.cacheService.getCachedData<Customer>('customers');
      if (cachedData) {
        // Filtere gecachte Daten nach isActive wenn nötig
        const filteredData = filters.isActive !== undefined
          ? cachedData.filter(c => c.isActive === filters.isActive)
          : cachedData;

        return of({
          success: true,
          data: filteredData,
          pagination: {
            page: 1,
            limit: filteredData.length,
            total: filteredData.length,
            pages: 1
          }
        });
      }

      // Verhindere mehrfache gleichzeitige Requests
      if (this.cacheService.isLoading('customers')) {
        // Warte auf den aktuellen Request
        return new Observable(observer => {
          const subscription = this.cacheService.getCacheObservable$<Customer>('customers').subscribe(entry => {
            if (entry && !entry.isLoading) {
              const filteredData = filters.isActive !== undefined
                ? entry.data.filter(c => c.isActive === filters.isActive)
                : entry.data;

              observer.next({
                success: true,
                data: filteredData,
                pagination: {
                  page: 1,
                  limit: filteredData.length,
                  total: filteredData.length,
                  pages: 1
                }
              });
              observer.complete();
              subscription.unsubscribe();
            }
          });
        });
      }
    }

    // Setze Loading-Status
    if (useCache) {
      this.cacheService.setLoading('customers', true);
    }

    let params = new HttpParams();

    if (filters.isActive !== undefined) {
      params = params.set('isActive', filters.isActive.toString());
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<CustomerListResponse>(this.apiUrl, { params }).pipe(
      tap(response => {
        // Cache nur die ungefilterten Daten (limit: 1000, isActive: true)
        if (useCache && response.success) {
          this.cacheService.setCachedData('customers', response.data);
        }
      })
    );
  }

  getCustomer(id: string): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customer: Partial<Customer>): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(this.apiUrl, customer).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Füge den neuen Kunden zum Cache hinzu
          this.cacheService.addCacheEntry('customers', response.data);
        }
      })
    );
  }

  updateCustomer(id: string, customer: Partial<Customer>): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(`${this.apiUrl}/${id}`, customer).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Aktualisiere den Kunden im Cache
          this.cacheService.updateCacheEntry('customers', response.data);
        }
      })
    );
  }

  deleteCustomer(id: string): Observable<CustomerResponse> {
    return this.http.delete<CustomerResponse>(`${this.apiUrl}/${id}`).pipe(
      tap(response => {
        if (response.success) {
          // Entferne den Kunden aus dem Cache
          this.cacheService.removeCacheEntry('customers', id);
        }
      })
    );
  }

  /**
   * Invalidiert den Customer-Cache (z.B. nach Bulk-Operationen)
   */
  invalidateCache(): void {
    this.cacheService.invalidateCache('customers');
  }
}
