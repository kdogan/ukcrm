import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PayPalOrderResponse {
  success: boolean;
  orderId: string;
  approvalUrl: string;
  message?: string;
}

export interface PayPalCaptureResponse {
  success: boolean;
  message: string;
  data: any;
  subscription: {
    package: string;
    billingInterval: string;
    billingIntervalText: string;
    price: number;
    savings: number;
    startDate: Date;
    endDate: Date;
    transactionId: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private apiUrl = `${environment.apiUrl}/paypal`;

  constructor(private http: HttpClient) { }

  /**
   * Create PayPal order for package purchase
   */
  createOrder(packageName: string, billingInterval: 'monthly' | 'yearly'): Observable<PayPalOrderResponse> {
    return this.http.post<PayPalOrderResponse>(`${this.apiUrl}/create-order`, {
      packageName,
      billingInterval
    });
  }

  /**
   * Capture PayPal order after user approval
   */
  captureOrder(orderId: string): Observable<PayPalCaptureResponse> {
    return this.http.post<PayPalCaptureResponse>(`${this.apiUrl}/capture-order`, {
      orderId
    });
  }

  /**
   * Get PayPal order details
   */
  getOrderDetails(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/order/${orderId}`);
  }
}
