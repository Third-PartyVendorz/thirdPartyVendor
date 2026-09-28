import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { Navbar } from './navbar/navbar';
import { DashboardPage } from './dashboard/dashboard-page/dashboard-page';


@Component({
  imports: [RouterOutlet, HomePage, Navbar, DashboardPage],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('TPV-front-end');
}
