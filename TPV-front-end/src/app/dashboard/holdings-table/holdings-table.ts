import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Holding } from './holding.model';
import { MOCK_HOLDINGS } from './mock-holdings';
import { HoldingService } from '../../services/holding.service';
import { AuthService } from '../../services/auth.service';

type SortColumn = 'ticker' | 'companyName' | 'shares' | 'averageCost' | 'lastPrice' | 'marketValue' | 'gainLoss' | 'dailyChangePercent' | null;
type SortDirection = 'asc' | 'desc' | null;

@Component({
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  selector: 'app-holdings-table',
  styleUrl: './holdings-table.scss',
  templateUrl: './holdings-table.html',
})
export class HoldingsTable implements OnInit {
  constructor(
    private holdingService: HoldingService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadHoldings();
  }

  @Input() holdings: Holding[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  sortColumn: SortColumn = null;
  sortDirection: SortDirection = null;
  displayCount: number = 10;
  readonly incrementCount: number = 10;
  expandedHoldings: Set<string> = new Set();

  // Fetch holdings from API
  loadHoldings(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // TODO: Get actual userId from your auth/user service
    const userId = 'user123'; // Replace with actual user ID

    this.holdingService.fetchHoldings(userId).subscribe({
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

  get sortedHoldings(): Holding[] {
    if (!this.sortColumn || !this.sortDirection) {
      return this.holdings;
    }

    const sorted = [...this.holdings].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (this.sortColumn) {
        case 'ticker':
          aValue = a.ticker;
          bValue = b.ticker;
          break;
        case 'companyName':
          aValue = a.companyName;
          bValue = b.companyName;
          break;
        case 'shares':
          aValue = a.shares;
          bValue = b.shares;
          break;
        case 'averageCost':
          aValue = a.averageCost;
          bValue = b.averageCost;
          break;
        case 'lastPrice':
          aValue = a.lastPrice;
          bValue = b.lastPrice;
          break;
        case 'marketValue':
          aValue = a.marketValue;
          bValue = b.marketValue;
          break;
        case 'gainLoss':
          aValue = a.gainLoss;
          bValue = b.gainLoss;
          break;
        case 'dailyChangePercent':
          aValue = a.dailyChangePercent;
          bValue = b.dailyChangePercent;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  get displayedHoldings(): Holding[] {
    return this.sortedHoldings.slice(0, this.displayCount);
  }

  get hasMoreHoldings(): boolean {
    return this.sortedHoldings.length > this.displayCount;
  }

  toggleSort(column: SortColumn): void {
    if (this.sortColumn === column) {
      // Same column clicked
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        // Reset to original order
        this.sortColumn = null;
        this.sortDirection = null;
      }
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortIndicator(column: SortColumn): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  toggleExpand(ticker: string): void {
    if (this.expandedHoldings.has(ticker)) {
      this.expandedHoldings.delete(ticker);
    } else {
      this.expandedHoldings.add(ticker);
    }
  }

  isExpanded(ticker: string): boolean {
    return this.expandedHoldings.has(ticker);
  }

  loadMore(): void {
    this.displayCount += this.incrementCount;
  }

  getGainClass(value: number): string {
    return value >= 0 ? 'positive' : 'negative';
  }

  getDayChangeClass(value: number): string {
    return value >= 0 ? 'positive' : 'negative';
  }

  getSortOptionLabel(column: SortColumn): string {
    switch (column) {
      case 'ticker': return 'Ticker';
      case 'companyName': return 'Name';
      case 'shares': return 'Shares';
      case 'averageCost': return 'Avg. Cost';
      case 'lastPrice': return 'Last Price';
      case 'marketValue': return 'Market Value';
      case 'gainLoss': return 'Total Gain/Loss';
      case 'dailyChangePercent': return 'Day Change';
      default: return 'Sort by';
    }
  }

  onSortChange(value: string): void {
    if (value === '') {
      // Reset to original order
      this.sortColumn = null;
      this.sortDirection = null;
    } else {
      this.toggleSort(value as SortColumn);
    }
  }
}
