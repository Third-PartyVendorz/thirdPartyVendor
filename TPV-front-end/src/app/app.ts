import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { AnalyticsDashboard } from './analytics-dashboard/analytics-dashboard';

@Component({
  imports: [RouterOutlet, HomePage, AnalyticsDashboard],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('TPV-front-end');
}
