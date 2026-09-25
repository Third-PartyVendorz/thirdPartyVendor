import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RegisterRequest } from '../dto/RegisterRequest';
import { RegisterResponse } from '../dto/RegisterResponse';

@Component({
  imports: [],
  selector: 'app-login-container',
  styleUrl: './login-container.scss',
  templateUrl: './login-container.html',
})
export class LoginContainer {
  constructor(private authService: AuthService) {}

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

    this.register(request);
  }

  register(request: RegisterRequest) {
    this.authService.register(request).subscribe({
      next: (response: RegisterResponse) => {
        console.log('Registration successful: ', response);
      },
      error: (error) => {
        console.error('Registration failed: ', error);
      },
    });
  }
}
