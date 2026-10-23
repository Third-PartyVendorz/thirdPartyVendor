import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-analyst-navbar',
  templateUrl: './analyst-navbar.html',
  styleUrl: './analyst-navbar.scss',
})
export class AnalystNavbar {
  constructor(private authService: AuthService) {}

  get accountIsFrozen(): boolean {
    return this.authService.isFrozen();
  }

  logout(): void {
    this.authService.logout().subscribe({
      error: () => this.authService.markSessionExpired(),
    });
  }
}
