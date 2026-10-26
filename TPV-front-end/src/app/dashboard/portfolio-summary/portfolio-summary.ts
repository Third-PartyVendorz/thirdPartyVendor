import { Component, DestroyRef, OnInit, Input, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TradeService } from '../../trade-page/trade.service';
import { MarketApiService } from '../../services/marketApi.service';
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
    private tradeService: TradeService,
    private marketApiService: MarketApiService,
    private destroyRef: DestroyRef
  ) {}
  buyingPower = signal(0);
  cashBalance = signal(0);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.tradeService.getCashHoldings().pipe(
      switchMap(holdings => {
        const rates: Record<string, Observable<number>> = { USD: of(1) };
        for (const holding of holdings) {
          const currency = holding.currencyCode.trim().toUpperCase();
          if (!rates[currency]) {
            rates[currency] = this.marketApiService.fetchForexQuote(currency, 'USD').pipe(
              map(response => {
                const rate = response.data.price;
                if (!Number.isFinite(rate) || rate <= 0) {
                  throw new Error(`Invalid USD exchange rate for ${currency}`);
                }
                return rate;
              })
            );
          }
        }

        return forkJoin(rates).pipe(
          map(exchangeRates => holdings.reduce((totals, holding) => {
            const rate = exchangeRates[holding.currencyCode.trim().toUpperCase()];
            return {
              cashBalance: totals.cashBalance + holding.balance * rate,
              buyingPower: totals.buyingPower + holding.buyingPower * rate
            };
          }, { cashBalance: 0, buyingPower: 0 }))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (totals) => {
        this.buyingPower.set(totals.buyingPower);
        this.cashBalance.set(totals.cashBalance);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load USD cash totals.');
        this.isLoading.set(false);
      }
    });
  }
  @Input() portfolioValue: number = 28463.72;
  @Input() dailyGainLoss: number = 1238.45;
  @Input() dailyGainLossPercentage: number = 4.55;
  @Input() totalGainLoss: number = 6892.37;
  @Input() totalGainLossPercent: number = 31.91;
}
