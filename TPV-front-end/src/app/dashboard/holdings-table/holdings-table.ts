import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Holding } from './holding.model';
import { MOCK_HOLDINGS } from './mock-holdings';

@Component({
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  selector: 'app-holdings-table',
  styleUrl: './holdings-table.scss',
  templateUrl: './holdings-table.html',
})
export class HoldingsTable {
  @Input() holdings: Holding[] = MOCK_HOLDINGS;

  getGainClass(value: number): string {
    return value >= 0 ? 'positive' : 'negative';
  }

  getDayChangeClass(value: number): string {
    return value >= 0 ? 'positive' : 'negative';
  }
}
