import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-login-container',
  styleUrl: './login-container.scss',
  templateUrl: './login-container.html',
})
export class LoginContainer {
  activeTab: 'login' | 'register' = 'register';

  showLogin() {
    this.activeTab = 'login';
  }

  showRegister() {
    this.activeTab = 'register';
  }
}
