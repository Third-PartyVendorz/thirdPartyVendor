import { Component, Input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  imports: [CurrencyPipe, DecimalPipe],
  selector: 'app-portfolio-summary',
  styleUrl: './portfolio-summary.scss',
  templateUrl: './portfolio-summary.html',
})
export class PortfolioSummary {
  @Input() portfolioValue: number = 28463.72;
  @Input() dailyGainLoss: number = 1238.45;
  @Input() dailyGainLossPercentage: number = 4.55;
  @Input() buyingPower: number = 4732.16;
  @Input() cashBalance: number = 2341.08;
  @Input() totalGainLoss: number = 6892.37;
  @Input() totalGainLossPercent: number = 31.91;
}
