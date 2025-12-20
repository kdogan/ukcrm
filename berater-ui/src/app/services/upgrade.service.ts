import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UpgradeRequest {
  _id: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    package: string;
  };
  currentPackage: string;
  requestedPackage: string;
  packageDetails: {
    name: string;
    displayName: string;
    price: number;
    currency: string;
    billingPeriod: string;
    maxCustomers: number;
    maxContracts: number;
    maxMeters: number;
  };
  paymentMethod?: string;
  paymentDetails?: {
    method?: string;
    transactionId?: string;
    amount?: number;
    currency?: string;
    paymentDate?: Date;
    paymentProof?: string;
  };
  status: 'pending' | 'payment_received' | 'approved' | 'rejected' | 'cancelled';
  notes?: string;
  reviewedBy?: any;
  reviewedAt?: Date;
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  _id: string;
  user: string;
  type: 'bankTransfer' | 'creditCard' | 'paypal' | 'sepa';
  bankDetails?: {
    accountHolder?: string;
    iban?: string;
    bic?: string;
    bankName?: string;
  };
  cardDetails?: {
    lastFourDigits?: string;
    cardType?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  paypalEmail?: string;
  isDefault: boolean;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UpgradeService {
  private apiUrl = `${environment.apiUrl}/upgrade`;

  constructor(private http: HttpClient) {}

  // Get available packages
  getAvailablePackages(): Observable<any> {
    return this.http.get(`${this.apiUrl}/packages`);
  }

  // Create upgrade request
  createUpgradeRequest(requestedPackage: string, paymentMethodId?: string, paymentDetails?: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, {
      requestedPackage,
      paymentMethodId,
      paymentDetails
    });
  }

  // Get my upgrade requests
  getMyUpgradeRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-requests`);
  }

  // Update payment info
  updatePaymentInfo(requestId: string, paymentInfo: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/request/${requestId}/payment`, paymentInfo);
  }

  // Cancel upgrade request
  cancelUpgradeRequest(requestId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/request/${requestId}`);
  }

  // Payment Methods
  addPaymentMethod(paymentMethodData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment-methods`, paymentMethodData);
  }

  getMyPaymentMethods(): Observable<any> {
    return this.http.get(`${this.apiUrl}/payment-methods`);
  }

  deletePaymentMethod(paymentMethodId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/payment-methods/${paymentMethodId}`);
  }
}
