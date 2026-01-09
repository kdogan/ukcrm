import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { SettingsService, UserSettings } from './settings.service';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  emailNotifications: boolean;
  package?: string;
  packageFeatures?: { name: string; enabled: boolean }[];
  settings?: UserSettings;
  isMasterBerater?: boolean;
  masterBerater?: string | {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private settingsService: SettingsService
  ) {
    this.loadUserFromStorage();
  }

  register(userData: { firstName: string; lastName: string; email: string; phone?: string; password: string; language?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-email/${token}`);
  }

  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, { email });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.success) {
            this.setSession(response.data);
            // Initialize settings from login response
            if (response.data.user.settings) {
              this.settingsService.initializeSettings(response.data.user.settings);
              // Apply theme colors after login
              this.settingsService.applyThemeColors();
            }
          }
        })
      );
  }

  logout(): void {
    // Clear session locally - this is sufficient for stateless JWT auth
    this.clearSession();
    this.router.navigate(['/login']);
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`)
      .pipe(
        tap((response: any) => {
          if (response.success) {
            this.currentUserSubject.next(response.data);
          }
        })
      );
  }

  updateProfile(data: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data)
      .pipe(
        tap((response: any) => {
          if (response.success) {
            // Aktualisiere den User auch im localStorage
            localStorage.setItem('user', JSON.stringify(response.data));
            this.currentUserSubject.next(response.data);
          }
        })
      );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, { currentPassword, newPassword });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, { password });
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response.success && response.data.token) {
            // Nur Access Token aktualisieren, Refresh Token ist im Cookie
            localStorage.setItem('token', response.data.token);
          }
        })
      );
  }

  getTestUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/test-users`);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setSession(authResult: { user: User; token: string; refreshToken?: string }): void {
    localStorage.setItem('token', authResult.token);
    // refreshToken wird nicht mehr im localStorage gespeichert (ist im httpOnly Cookie)
    localStorage.setItem('user', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        // Initialize settings if available
        if (user.settings) {
          this.settingsService.initializeSettings(user.settings);
          // Apply theme colors on initial load
          this.settingsService.applyThemeColors();
        }
        // Aktualisiere User-Daten vom Server (packageFeatures könnten sich geändert haben)
        this.refreshUserData();
      } catch (e) {
        this.clearSession();
      }
    }
  }

  /**
   * Lädt aktuelle User-Daten vom Server und aktualisiert localStorage
   * Wichtig um Änderungen an Package-Features zu erhalten
   */
  private refreshUserData(): void {
    this.http.get<any>(`${this.apiUrl}/me`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const updatedUser = response.data;
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
          // Update settings if changed
          if (updatedUser.settings) {
            this.settingsService.initializeSettings(updatedUser.settings);
          }
        }
      },
      error: (err) => {
        // Bei 401 (Token abgelaufen) wird der Auth-Interceptor das handlen
        console.error('Fehler beim Aktualisieren der User-Daten:', err);
      }
    });
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Aktualisiere den aktuellen User (z.B. nach Paket-Wechsel)
  updateCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
