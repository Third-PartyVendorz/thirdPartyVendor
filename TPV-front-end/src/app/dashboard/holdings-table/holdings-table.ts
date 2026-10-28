import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Holding } from './holding.model';

type SortColumn = 'ticker' | 'companyName' | 'assetType' | 'shares' | 'price' | 'marketValue' | 'totalChange' | 'dailyChange' | null;
type SortDirection = 'asc' | 'desc' | null;

@Component({
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe, RouterLink],
  selector: 'app-holdings-table',
  styleUrl: './holdings-table.scss',
  templateUrl: './holdings-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoldingsTable {
  @Input() holdings: Holding[] = [];
  sortColumn: SortColumn = null;
  sortDirection: SortDirection = null;
  displayCount: number = 10;
  readonly incrementCount: number = 10;
  expandedHoldings: Set<string> = new Set();

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
          aValue = a.companyName || '';
          bValue = b.companyName || '';
          break;
        case 'assetType':
          aValue = a.assetType || '';
          bValue = b.assetType || '';
          break;
        case 'shares':
          aValue = a.numShares;
          bValue = b.numShares;
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'marketValue':
          aValue = a.marketValue || 0;
          bValue = b.marketValue || 0;
          break;
        case 'totalChange':
          aValue = a.gainLoss || 0;
          bValue = b.gainLoss || 0;
          break;
        case 'dailyChange':
          aValue = a.change || 0;
          bValue = b.change || 0;
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

  getSortState(column: SortColumn): SortDirection | 'none' {
    if (this.sortColumn !== column || !this.sortDirection) {
      return 'none';
    }

    return this.sortDirection;
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
      case 'assetType': return 'Asset Type'
      case 'shares': return 'Shares';
      case 'price': return 'Current Price';
      case 'marketValue': return 'Market Value';
      // case 'gainLoss': return 'Total Gain/Loss';
      case 'totalChange': return 'Total Change';
      case 'dailyChange': return 'Day Change';
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
