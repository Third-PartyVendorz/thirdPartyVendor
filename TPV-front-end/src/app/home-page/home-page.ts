import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RegisterRequest } from '../dto/RegisterRequest';
import { RegisterResponse } from '../dto/RegisterResponse';
import { AuthenticationResponse } from '../dto/AuthenticationResponse';
import { AuthenticationRequest } from '../dto/AuthenticationRequest';
import { LoginContainer } from '../login-container/login-container';

@Component({
  imports: [LoginContainer],
  selector: 'app-home-page',
  styleUrl: './home-page.scss',
  templateUrl: './home-page.html',
})
export class HomePage {
constructor(private authService: AuthService) {}

  onRegister(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const request: RegisterRequest = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    } as RegisterRequest;
    
    this.register(request);
  }

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

  //TODO: move to login component once created
  authenticate(request: AuthenticationRequest) {
    this.authService.authenticate(request).subscribe({
      next: (response: AuthenticationResponse) => {
        this.authService.setAuthToken(response.jwtToken);
        // remove console logging once proper logging is implemented
        console.log("Authentication successful: ", response);
      },
      error: (error) => {
        console.error("Authentication failed: ", error);
      }
    });
  }
}

