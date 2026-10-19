import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminNavbar } from '../admin/admin-navbar/admin-navbar';

@Component({
  standalone: true,
  imports: [RouterOutlet, AdminNavbar],
  selector: 'app-admin-layout',
  template: `
    <app-admin-navbar></app-admin-navbar>
    <router-outlet></router-outlet>
  `,
  styleUrl: './admin-layout.scss',
})
export class AdminLayoutComponent {}
