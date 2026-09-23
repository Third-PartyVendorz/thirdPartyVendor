import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegistrationPage } from './registration-page/registration-page';

@Component({
  imports: [RouterOutlet, RegistrationPage],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('TPV-front-end');
}
