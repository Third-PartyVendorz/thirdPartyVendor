import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterRequest } from '../dto/RegisterRequest';
import { RegisterResponse } from '../dto/RegisterResponse';
import { AuthenticationRequest } from '../dto/AuthenticationRequest';
import { AuthenticationResponse } from '../dto/AuthenticationResponse';
import { AuthMeResponse } from '../dto/AuthMeResponse';
import { environment } from '../../environments/environment.local';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticatedSession: boolean = false;
  private readonly userRoleSignal = signal<string | null>(null);
  readonly userRole = this.userRoleSignal.asReadonly();

  constructor(private http: HttpClient, private userContextService: UserContextService, private router: Router) {}

  register(registerRequest: RegisterRequest) {
    return this.http.post<RegisterResponse>(`${environment.apiBaseUrl}/auth/register`, registerRequest);
  }

  authenticate(authenticationRequest: AuthenticationRequest) {
    return this.http.post<AuthenticationResponse>(`${environment.apiBaseUrl}/auth/authenticate`, authenticationRequest, {
      withCredentials: true,
    }).pipe(
      tap((response) => {
        this.setUserRole(response.role);
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
        this.setUserRole(null); // Clear the user role on logout
      }),
    );
  }

  refreshToken() {
    return this.http.post<AuthMeResponse>(`${environment.apiBaseUrl}/auth/refresh`, {}, {
      withCredentials: true,
    }).pipe(
      tap((response) => {
        this.setUserRole(response.role);
        this.markSessionAuthenticated();
      }),
    );
  }

  checkSession(): Observable<boolean> {
    const sessionCheckUrl = `${environment.apiBaseUrl}/auth/me`;

    return this.http.get<AuthMeResponse>(sessionCheckUrl, {
      withCredentials: true,
    }).pipe(
      tap((response) => {
        this.setUserRole(response.role);
      }),
      map(() => {
        this.markSessionAuthenticated();
        return true;
      }),
      catchError((error: unknown) => {
        if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
          return of(false);
        }

        return this.refreshToken().pipe(
          map(() => true),
          catchError(() => {
            this.markSessionExpired();
            this.setUserRole(null); // Clear the user role on failed refresh
            return of(false);
          }),
        );
      }),
    );
  }

  getSessionState() {
    return this.authenticatedSession;
  }

  markSessionAuthenticated() {
    this.authenticatedSession = true;
  }

  getUserRole() {
    return this.userRoleSignal();
  }

  private setUserRole(role: string | null) {
    this.userRoleSignal.set(role);
  }

  markSessionExpired() {
    this.authenticatedSession = false;
    this.userRoleSignal.set(null);
    this.userContextService.clearUserContext();
    this.router.navigateByUrl('/login');
  }

}