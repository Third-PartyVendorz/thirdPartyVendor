import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RegisterRequest } from '../dto/RegisterRequest';
import { RegisterResponse } from '../dto/RegisterResponse';
import { AuthenticationResponse } from '../dto/AuthenticationResponse';
import { AuthenticationRequest } from '../dto/AuthenticationRequest';


@Component({
  imports: [],
  selector: 'app-registration-page',
  styleUrl: './registration-page.scss',
  templateUrl: './registration-page.html',
})
export class RegistrationPage {
  constructor(private authService: AuthService) {}

  register(request: RegisterRequest) {
    this.authService.register(request).subscribe({
      next: (response: RegisterResponse) => {
        console.log("Registration successful: ", response);
      },
      error: (error) => {
        console.error("Registration failed: ", error);
      }
    });
  }

  authenticate(request: AuthenticationRequest) {
    this.authService.authenticate(request).subscribe({
      next: (response: AuthenticationResponse) => {
        localStorage.setItem('authToken', response.jwtToken);
        console.log("Authentication successful: ", response);
      },
      error: (error) => {
        console.error("Authentication failed: ", error);
      }
    });
  }
}
