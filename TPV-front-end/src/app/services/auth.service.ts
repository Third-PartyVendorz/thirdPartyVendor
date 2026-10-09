import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterRequest } from '../dto/RegisterRequest';
import { RegisterResponse } from '../dto/RegisterResponse';
import { AuthenticationRequest } from '../dto/AuthenticationRequest';
import { AuthenticationResponse } from '../dto/AuthenticationResponse';
import { environment } from '../../environments/environment.local';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly authenticatedSessionKey = 'authenticatedSession';
  private authenticatedSession: boolean | null;

  constructor(private http: HttpClient, private userContextService: UserContextService) {
    this.authenticatedSession = this.readSessionState();
  }

  register(registerRequest: RegisterRequest) {
    return this.http.post<RegisterResponse>(`${environment.apiBaseUrl}/auth/register`, registerRequest);
  }

  authenticate(authenticationRequest: AuthenticationRequest) {
    return this.http.post<AuthenticationResponse>(`${environment.apiBaseUrl}/auth/authenticate`, authenticationRequest, {
      withCredentials: true,
    }).pipe(
      tap(() => {
        this.markSessionAuthenticated();
      }),
    );
  }

  refreshToken() {
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/refresh`, {}, {
      withCredentials: true,
    }).pipe(
      tap(() => {
        this.markSessionAuthenticated();
      }),
    );
  }

  checkSession(): Observable<boolean> {
    return this.http.get<void>(`${environment.apiBaseUrl}/auth/me`, {
      withCredentials: true,
    }).pipe(
      map(() => {
        this.markSessionAuthenticated();
        return true;
      }),
      catchError(() => {
        return of(false);
      }),
    );
  }

  getSessionState() {
    return this.authenticatedSession;
  }

  markSessionAuthenticated() {
    this.authenticatedSession = true;
    localStorage.setItem(AuthService.authenticatedSessionKey, 'true');
  }

  markSessionExpired() {
    this.authenticatedSession = false;
    localStorage.setItem(AuthService.authenticatedSessionKey, 'false');
    this.userContextService.clearUserContext();
  }

  private readSessionState(): boolean | null {
    const storedSessionState = localStorage.getItem(AuthService.authenticatedSessionKey);

    if (storedSessionState === 'true') {
      return true;
    }

    if (storedSessionState === 'false') {
      return false;
    }

    return null;
  }

}