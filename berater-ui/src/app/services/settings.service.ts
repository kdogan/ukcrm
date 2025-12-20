import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserSettings {
  reminderDays: {
    days90: boolean;
    days60: boolean;
    days30: boolean;
    custom?: number;
  };
  sidebarLabels: {
    dashboard: string;
    customers: string;
    meters: string;
    contracts: string;
    todos: string;
    suppliers: string;
  };
  notifications: {
    email: boolean;
    browser: boolean;
  };
  theme: {
    sidebarColor: string;
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  reminderDays: {
    days90: true,
    days60: true,
    days30: true,
    custom: undefined
  },
  sidebarLabels: {
    dashboard: 'Dashboard',
    customers: 'Kunden',
    meters: 'Zähler',
    contracts: 'Verträge',
    todos: 'TODOs',
    suppliers: 'Anbieter'
  },
  notifications: {
    email: true,
    browser: false
  },
  theme: {
    sidebarColor: 'mint'
  }
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<UserSettings>(DEFAULT_SETTINGS);
  public settings$ = this.settingsSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  loadSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/settings`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.settingsSubject.next(response.data);
        }
      })
    );
  }

  initializeSettings(settings: UserSettings): void {
    if (settings) {
      this.settingsSubject.next(settings);
    } else {
      this.settingsSubject.next(DEFAULT_SETTINGS);
    }
  }

  saveSettings(settings: UserSettings): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/settings`, { settings }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.settingsSubject.next(response.data);
        }
      })
    );
  }

  getSettings(): UserSettings {
    return this.settingsSubject.value;
  }

  resetToDefaults(): Observable<any> {
    return this.saveSettings(DEFAULT_SETTINGS);
  }

  getSidebarColor(): string {
    const color = this.settingsSubject.value.theme.sidebarColor;
    const colorMap: { [key: string]: string } = {
      mint: 'linear-gradient(180deg, #6ee7b7 0%, #34d399 100%)',
      blue: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
      purple: 'linear-gradient(180deg, #a78bfa 0%, #8b5cf6 100%)',
      orange: 'linear-gradient(180deg, #fb923c 0%, #f97316 100%)',
      red: 'linear-gradient(180deg, #f87171 0%, #ef4444 100%)'
    };
    return colorMap[color] || colorMap['mint'];
  }

  getReminderDays(): number[] {
    const settings = this.settingsSubject.value;
    const days: number[] = [];

    if (settings.reminderDays.days90) days.push(90);
    if (settings.reminderDays.days60) days.push(60);
    if (settings.reminderDays.days30) days.push(30);
    if (settings.reminderDays.custom && settings.reminderDays.custom > 0) {
      days.push(settings.reminderDays.custom);
    }

    return days;
  }
}
