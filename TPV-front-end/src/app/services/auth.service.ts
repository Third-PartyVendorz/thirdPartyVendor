import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterRequest } from '../dto/RegisterRequest';
import { RegisterResponse } from '../dto/RegisterResponse';
import { AuthenticationRequest } from '../dto/AuthenticationRequest';
import { AuthenticationResponse } from '../dto/AuthenticationResponse';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  register(registerRequest: RegisterRequest) {
    return this.http.post<RegisterResponse>(`${environment.apiBaseUrl}/auth/register`, registerRequest);
  }

  authenticate(authenticationRequest: AuthenticationRequest) {
    return this.http.post<AuthenticationResponse>(`${environment.apiBaseUrl}/auth/authenticate`, authenticationRequest);
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  setAuthToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  clearAuthToken() {
    localStorage.removeItem('authToken');
  }

}