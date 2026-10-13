import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.local';
import { ChangePasswordRequest } from '../dto/ChangePasswordRequest';
import { EditAccountRequest } from '../dto/EditAccountRequest';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  constructor(private http: HttpClient) {}

  editAccount(userId: number, request: EditAccountRequest): Observable<string> {
    return this.http.put(`${environment.apiBaseUrl}/users/${userId}/edit`, request, {
      responseType: 'text' as const,
    });
  }

  changePassword(userId: number, request: ChangePasswordRequest): Observable<string> {
    return this.http.put(`${environment.apiBaseUrl}/users/${userId}/changePassword`, request, {
      responseType: 'text' as const,
    });
  }

  deleteAccount(userId: number): Observable<string> {
    return this.http.delete(`${environment.apiBaseUrl}/users/${userId}/delete`, {
      responseType: 'text' as const,
    });
  }
}