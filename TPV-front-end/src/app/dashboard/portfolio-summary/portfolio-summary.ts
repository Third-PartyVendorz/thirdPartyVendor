import { Component, OnInit, Input, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { TradeService } from '../../trade-page/trade.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  selector: 'app-portfolio-summary',
  styleUrl: './portfolio-summary.scss',
  templateUrl: './portfolio-summary.html',
})
export class PortfolioSummary implements OnInit {
  constructor(
    private tradeService: TradeService
  ) {}
  buyingPower = signal(0);
  cashBalance = signal(0);

  ngOnInit(): void {
    this.tradeService.getCashHoldingByCurrencyCode('USD').subscribe({
      next: (response) => {
        this.buyingPower.set(response.balance);
        this.cashBalance.set(response.balance);
      },
      error: (error) => {
        this.buyingPower.set(0);
        this.cashBalance.set(0);
      }
    });
  }
  @Input() portfolioValue: number = 28463.72;
  @Input() dailyGainLoss: number = 1238.45;
  @Input() dailyGainLossPercentage: number = 4.55;
  @Input() totalGainLoss: number = 6892.37;
  @Input() totalGainLossPercent: number = 31.91;
}
