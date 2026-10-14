import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
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
  private authenticatedSession: boolean = false;

  constructor(private http: HttpClient, private userContextService: UserContextService, private router: Router) {}

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

  logout() {
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/logout`, {}, {
      withCredentials: true,
    }).pipe(
      tap(() => {
        this.markSessionExpired();
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
  }

  markSessionExpired() {
    this.authenticatedSession = false;
    this.userContextService.clearUserContext();
    this.router.navigateByUrl('/login');
  }

}