import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  selector: 'app-analyst-navbar',
  templateUrl: './analyst-navbar.html',
  styleUrl: './analyst-navbar.scss',
})
export class AnalystNavbar {
  isMenuOpen = false;
  isProfileMenuOpen = false;

  constructor(private authService: AuthService) {}

  get accountIsFrozen(): boolean {
    return this.authService.isFrozen();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const navbar = (event.currentTarget as Document).querySelector('app-analyst-navbar');
    if (navbar && !navbar.contains(target)) {
      this.isMenuOpen = false;
      this.isProfileMenuOpen = false;
    }
  }

  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isMenuOpen = false;
  }

  logout(): void {
    this.isProfileMenuOpen = false;
    this.authService.logout().subscribe({
      error: () => this.authService.markSessionExpired(),
    });
  }
}
