import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'app-navbar',
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
})
export class Navbar {
  isMenuOpen = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const navbar = (event.currentTarget as Document).querySelector('app-navbar');
    
    if (navbar && !navbar.contains(target)) {
      this.isMenuOpen = false;
    }
  }
}
