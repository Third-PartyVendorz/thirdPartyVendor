import { Component } from '@angular/core';
import { LoginContainer } from '../login-container/login-container';

@Component({
  standalone: true,
  imports: [LoginContainer],
  selector: 'app-auth-page',
  styleUrl: './auth-page.scss',
  templateUrl: './auth-page.html',
})
export class AuthPage {}