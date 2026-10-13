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

  editAccount(request: EditAccountRequest): Observable<string> {
    return this.http.put(`${environment.apiBaseUrl}/users/edit`, request, {
      responseType: 'text' as const,
    });
  }

  changePassword(request: ChangePasswordRequest): Observable<string> {
    return this.http.put(`${environment.apiBaseUrl}/users/changePassword`, request, {
      responseType: 'text' as const,
    });
  }

  deleteAccount(): Observable<string> {
    return this.http.delete(`${environment.apiBaseUrl}/users/delete`, {
      responseType: 'text' as const,
    });
  }
}