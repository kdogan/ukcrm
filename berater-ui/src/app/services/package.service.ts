import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Package {
  _id: string;
  name: string;
  displayName: string;
  maxContracts: number;
  maxCustomers: number;
  maxMeters: number;
  monthlyPrice: number;
  yearlyPrice?: number;
  yearlySavings?: number;
  currency: string;
  isActive: boolean;
  isFree: boolean;
  order: number;
  features?: { name: string; enabled: boolean }[];
}

export interface UserLimits {
  package: Package;
  usage: {
    contracts: number;
    customers: number;
    meters: number;
  };
  limits: {
    maxContracts: number;
    maxCustomers: number;
    maxMeters: number;
    contractsRemaining: number;
    customersRemaining: number;
    metersRemaining: number;
    isAtContractLimit: boolean;
    isAtCustomerLimit: boolean;
    isAtMeterLimit: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private apiUrl = `${environment.apiUrl}/packages`;

  constructor(private http: HttpClient) {}

  // Get all available packages
  getAllPackages(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // Get single package
  getPackage(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Get current user's limits
  getUserLimits(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my/limits`);
  }

  // Get current user's subscription info
  getSubscriptionInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my/subscription`);
  }

  // Purchase a package with billing interval
  purchasePackage(packageName: string, billingInterval: 'monthly' | 'yearly'): Observable<any> {
    return this.http.post(`${this.apiUrl}/purchase`, { packageName, billingInterval });
  }

  // Upgrade/downgrade package with billing interval
  upgradePackage(packageName: string, billingInterval: 'monthly' | 'yearly'): Observable<any> {
    return this.http.post(`${this.apiUrl}/upgrade`, { packageName, billingInterval });
  }

  // Superadmin: Create package
  createPackage(packageData: Partial<Package>): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/create`, packageData);
  }

  // Superadmin: Update package
  updatePackage(id: string, packageData: Partial<Package>): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/${id}`, packageData);
  }

  // Superadmin: Delete package
  deletePackage(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/${id}`);
  }
}
