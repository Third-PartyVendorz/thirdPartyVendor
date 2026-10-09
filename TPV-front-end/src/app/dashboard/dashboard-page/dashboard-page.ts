import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioSummary } from '../portfolio-summary/portfolio-summary';
import { Navbar } from '../../navbar/navbar';
import { HoldingsTable } from '../holdings-table/holdings-table';
import { PortfolioGraphics } from '../portfolio-graphics/portfolio-graphics';
import { HoldingService } from '../../services/holding.service';
import { AuthService } from '../../services/auth.service';
import { Holding } from '../holdings-table/holding.model';

@Component({
  standalone: true,
  imports: [CommonModule, Navbar, PortfolioSummary, HoldingsTable, PortfolioGraphics],
  selector: 'app-dashboard-page',
  styleUrl: './dashboard-page.scss',
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage implements OnInit {
  holdings: Holding[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private holdingService: HoldingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHoldings();
  }

  loadHoldings(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();
    
    this.holdingService.fetchHoldingsFromAPI().subscribe({
      next: (data: Holding[]) => {
        this.holdings = data;
        console.log('Holdings loaded:', data);
        this.isLoading = false;
        this.cdr.markForCheck();  // Notify change detection
      },
      error: (error) => {
        console.error('Error fetching holdings:', error);
        this.errorMessage = 'Failed to load holdings from API.';
        this.holdings = [];
        this.isLoading = false;
        this.cdr.markForCheck();  // Notify change detection
      }
    });
  }
}
