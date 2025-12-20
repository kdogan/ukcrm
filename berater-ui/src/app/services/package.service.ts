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
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  isActive: boolean;
  isFree: boolean;
  order: number;
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

  // Upgrade user's package
  upgradePackage(packageName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/my/upgrade`, { packageName });
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
