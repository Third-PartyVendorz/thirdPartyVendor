import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorService } from './services/error.service';

@Component({
  standalone: true,
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  constructor(public errorService: ErrorService) {}

  protected readonly title = signal('TPV-front-end');
}
