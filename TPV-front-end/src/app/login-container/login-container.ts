import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RegisterRequest } from '../dto/RegisterRequest';
import { RegisterResponse } from '../dto/RegisterResponse';
import { CommonModule } from '@angular/common';
import { AuthenticationRequest } from '../dto/AuthenticationRequest';
import { AuthenticationResponse } from '../dto/AuthenticationResponse';
import { Router } from '@angular/router';
import { MessageService } from '../services/message.service';
import { UserContextService } from '../services/user-context.service';
import { UserContext } from '../dto/UserContext';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-login-container',
  styleUrl: './login-container.scss',
  templateUrl: './login-container.html',
})
export class LoginContainer {
  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private userContextService: UserContextService,
    private router: Router,
  ) {}

  activeTab: 'login' | 'register' = 'register';

  showLogin() {
    this.activeTab = 'login';
  }

  showRegister() {
    this.activeTab = 'register';
  }

  onRegister(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const request: RegisterRequest = {
      firstName: String(formData.get('firstName') ?? ''),
      lastName: String(formData.get('lastName') ?? ''),
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
      phoneNumber: String(formData.get('phoneNumber') ?? ''),
      dateOfBirth: new Date(String(formData.get('dateOfBirth') ?? '')),
    };

    form.reset();

    this.register(request);
  }

  onLogin(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const request: AuthenticationRequest = {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    };

    form.reset();

    this.authenticate(request);
  }

  register(request: RegisterRequest) {
    this.authService.register(request).subscribe({
      next: (response: RegisterResponse) => {
        this.messageService.setSuccessMessage('Registration successful. You can now log in.');
      },
      error: (error) => {
        this.messageService.setErrorMessage('Registration failed: ' + error.error.message);
      },
    });
  }

  authenticate (request: AuthenticationRequest) {
    this.authService.authenticate(request).subscribe({
      next: (response: AuthenticationResponse) => {
        this.messageService.setSuccessMessage('Login successful.');
        this.authService.setAuthToken(response.jwtToken);
        const userContext: UserContext = {
          firstName: response.firstName,
          lastName: response.lastName,
          phoneNumber: response.phoneNumber,
          dateOfBirth: response.dateOfBirth,
          email: response.email
        }
        this.userContextService.setUserContext(userContext);
        this.router.navigateByUrl('/');
      },
      error: (error) => {
        this.messageService.setErrorMessage('Login failed: ' + error.error.message);
      }
    })
  }
}
