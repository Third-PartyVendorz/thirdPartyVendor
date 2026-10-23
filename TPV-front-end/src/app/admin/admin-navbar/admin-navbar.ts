import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.html',
  styleUrl: './admin-navbar.scss',
})
export class AdminNavbar {
  isMenuOpen = false;

  constructor(private authService: AuthService) {}

  get accountIsFrozen(): boolean {
    return this.authService.isFrozen();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const navbar = (event.currentTarget as Document).querySelector('app-admin-navbar');
    if (navbar && !navbar.contains(target)) this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      error: () => this.authService.markSessionExpired(),
    });
  }
}
