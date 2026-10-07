import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterRequest } from '../dto/RegisterRequest';
import { RegisterResponse } from '../dto/RegisterResponse';
import { AuthenticationRequest } from '../dto/AuthenticationRequest';
import { AuthenticationResponse } from '../dto/AuthenticationResponse';
import { environment } from '../../environments/environment.local';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticatedSession: boolean | null = null;

  constructor(private http: HttpClient) { }

  register(registerRequest: RegisterRequest) {
    return this.http.post<RegisterResponse>(`${environment.apiBaseUrl}/auth/register`, registerRequest);
  }

  authenticate(authenticationRequest: AuthenticationRequest) {
    return this.http.post<AuthenticationResponse>(`${environment.apiBaseUrl}/auth/authenticate`, authenticationRequest).pipe(
      tap(() => {
        this.markSessionAuthenticated();
      }),
    );
  }

  checkSession(): Observable<boolean> {
    return this.http.get<void>(`${environment.apiBaseUrl}/auth/me`).pipe(
      map(() => {
        this.markSessionAuthenticated();
        return true;
      }),
      catchError(() => {
        this.markSessionExpired();
        return of(false);
      }),
    );
  }

  getSessionState() {
    return this.authenticatedSession;
  }

  markSessionAuthenticated() {
    this.authenticatedSession = true;
  }

  markSessionExpired() {
    this.authenticatedSession = false;
  }

}