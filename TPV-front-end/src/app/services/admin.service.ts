import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.local';
import { AdminUser } from '../dto/AdminUser';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${environment.apiBaseUrl}/admin/users`);
  }

  freezeUser(userId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/admin/users/${userId}/freeze`, {});
  }

  unfreezeUser(userId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/admin/users/${userId}/unfreeze`, {});
  }
}
