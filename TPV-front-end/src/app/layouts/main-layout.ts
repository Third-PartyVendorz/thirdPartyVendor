import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `,
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent {}
