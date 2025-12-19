import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Reminder {
  _id: string;
  contractId: any;
  reminderType: '90days' | '60days' | '30days';
  dueDate: Date;
  status: 'open' | 'done' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private apiUrl = `${environment.apiUrl}/reminders`;

  constructor(private http: HttpClient) {}

  getReminders(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get(this.apiUrl, { params });
  }

  getReminder(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createReminder(reminder: Partial<Reminder>): Observable<any> {
    return this.http.post(this.apiUrl, reminder);
  }

  updateReminder(id: string, reminder: Partial<Reminder>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, reminder);
  }

  markAsDone(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status: 'done' });
  }

  cancelReminder(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status: 'cancelled' });
  }
}
