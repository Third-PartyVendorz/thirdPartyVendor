import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioSummary } from '../portfolio-summary/portfolio-summary';
import { Navbar } from '../../navbar/navbar';
import { HoldingsTable } from '../holdings-table/holdings-table';
import { PortfolioGraphics } from '../portfolio-graphics/portfolio-graphics';
import { HoldingService } from '../../services/holding.service';
import { AuthService } from '../../services/auth.service';
import { Holding } from '../holdings-table/holding.model';
import { MOCK_HOLDINGS } from '../holdings-table/mock-holdings';

@Component({
  standalone: true,
  imports: [CommonModule, Navbar, PortfolioSummary, HoldingsTable, PortfolioGraphics],
  selector: 'app-dashboard-page',
  styleUrl: './dashboard-page.scss',
  templateUrl: './dashboard-page.html',
})
export class DashboardPage implements OnInit {
  holdings: Holding[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private holdingService: HoldingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHoldings();
  }

  loadHoldings(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.holdingService.fetchHoldings().subscribe({
      next: (data: Holding[]) => {
        this.holdings = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching holdings:', error);
        this.errorMessage = 'Failed to load holdings. Using mock data.';
        this.holdings = MOCK_HOLDINGS; // Fallback to mock data on error
        this.isLoading = false;
      }
    });
  }
}
