import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Holding } from './holding.model';
import { MOCK_HOLDINGS } from './mock-holdings';

type SortColumn = 'ticker' | 'gainLoss' | null;
type SortDirection = 'asc' | 'desc' | null;

@Component({
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  selector: 'app-holdings-table',
  styleUrl: './holdings-table.scss',
  templateUrl: './holdings-table.html',
})
export class HoldingsTable {
  @Input() holdings: Holding[] = MOCK_HOLDINGS;
  sortColumn: SortColumn = null;
  sortDirection: SortDirection = null;
  displayCount: number = 10;
  readonly incrementCount: number = 10;

  get sortedHoldings(): Holding[] {
    if (!this.sortColumn || !this.sortDirection) {
      return this.holdings;
    }

    const sorted = [...this.holdings].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (this.sortColumn === 'ticker') {
        aValue = a.ticker;
        bValue = b.ticker;
      } else if (this.sortColumn === 'gainLoss') {
        aValue = a.gainLoss;
        bValue = b.gainLoss;
      } else {
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

  loadMore(): void {
    this.displayCount += this.incrementCount;
  }

  getGainClass(value: number): string {
    return value >= 0 ? 'positive' : 'negative';
  }

  getDayChangeClass(value: number): string {
    return value >= 0 ? 'positive' : 'negative';
  }
}
