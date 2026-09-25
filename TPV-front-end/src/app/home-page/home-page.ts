import { Component } from '@angular/core';
import { LoginContainer } from '../login-container/login-container';

@Component({
  imports: [LoginContainer],
  selector: 'app-home-page',
  styleUrl: './home-page.scss',
  templateUrl: './home-page.html',
})
export class HomePage {
}

