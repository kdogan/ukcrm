import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AppUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'berater' | 'admin' | 'superadmin';
  package: 'basic' | 'professional' | 'enterprise';
  isActive: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  blockedAt?: Date;
  packageLimits: {
    maxCustomers: number;
    maxContracts: number;
    maxMeters: number;
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  total: number;
  active: number;
  blocked: number;
  inactive: number;
  byRole: {
    [key: string]: number;
  };
  byPackage: {
    [key: string]: number;
  };
}

export interface UserListResponse {
  success: boolean;
  data: AppUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getUsers(filters: {
    role?: string;
    package?: string;
    isActive?: boolean;
    isBlocked?: boolean;
    page?: number;
    limit?: number;
  } = {}): Observable<UserListResponse> {
    let params = new HttpParams();

    if (filters.role) params = params.set('role', filters.role);
    if (filters.package) params = params.set('package', filters.package);
    if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());
    if (filters.isBlocked !== undefined) params = params.set('isBlocked', filters.isBlocked.toString());
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<UserListResponse>(`${this.apiUrl}/users`, { params });
  }

  getUser(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  createUser(user: Partial<AppUser> & { password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, user);
  }

  updateUser(id: string, user: Partial<AppUser>): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, user);
  }

  blockUser(id: string, reason: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/block`, { reason });
  }

  unblockUser(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/unblock`, {});
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  getUserStats(): Observable<{ success: boolean; data: UserStats }> {
    return this.http.get<{ success: boolean; data: UserStats }>(`${this.apiUrl}/stats`);
  }

  resetPassword(id: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/reset-password`, { newPassword });
  }

  // Upgrade Request Management
  getAllUpgradeRequests(filters: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Observable<any> {
    let params = new HttpParams();

    if (filters.status) params = params.set('status', filters.status);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get(`${this.apiUrl}/upgrade-requests`, { params });
  }

  getUpgradeRequest(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/upgrade-requests/${id}`);
  }

  approveUpgradeRequest(id: string, adminNotes?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/upgrade-requests/${id}/approve`, { adminNotes });
  }

  rejectUpgradeRequest(id: string, rejectionReason: string, adminNotes?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/upgrade-requests/${id}/reject`, {
      rejectionReason,
      adminNotes
    });
  }

  getUpgradeRequestStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/upgrade-requests/stats`);
  }
}
