import { Component, DestroyRef, OnInit, Input, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, defer, forkJoin, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { TradeService } from '../../trade-page/trade.service';
import { MarketApiService } from '../../services/marketApi.service';
import { Holding } from '../holdings-table/holding.model';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
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
  securitiesValue = signal(0);
  isSecuritiesLoading = signal(true);
  securitiesError = signal<string | null>(null);
  private readonly holdingsSubject = new BehaviorSubject<Holding[]>([]);
  private readonly exchangeRates = new Map<string, Observable<number>>();

  @Input() set holdings(value: Holding[]) {
    this.holdingsSubject.next(value);
  }
  @Input() holdingsLoading = false;
  @Input() holdingsError: string | null = null;

  get portfolioValue(): number {
    return this.cashBalance() + this.securitiesValue();
  }

  private usdRate(currencyCode: string): Observable<number> {
    const currency = currencyCode.trim().toUpperCase();
    if (currency === 'USD') return of(1);
    let rate = this.exchangeRates.get(currency);
    if (!rate) {
      rate = this.marketApiService.fetchForexQuote(currency, 'USD').pipe(
        map(response => {
          const price = response.data.price;
          if (!Number.isFinite(price) || price <= 0) {
            throw new Error(`Invalid USD exchange rate for ${currency}`);
          }
          return price;
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
      this.exchangeRates.set(currency, rate);
    }
    return rate;
  }

  ngOnInit(): void {
    this.holdingsSubject.pipe(
      switchMap(holdings => defer(() => {
        this.isSecuritiesLoading.set(true);
        this.securitiesError.set(null);
        const values = holdings.map(holding => {
          if (!holding.currency?.trim() || !Number.isFinite(holding.marketValue)) {
            throw new Error(`Missing market valuation for ${holding.ticker}`);
          }
          return this.usdRate(holding.currency).pipe(
            map(rate => holding.marketValue! * rate)
          );
        });
        return (values.length ? forkJoin(values) : of([] as number[])).pipe(
          map(amounts => amounts.reduce((total, amount) => total + amount, 0))
        );
      }).pipe(
        catchError(() => {
          this.securitiesError.set('Unable to value all security holdings in USD.');
          return of(0);
        })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.securitiesValue.set(value);
      this.isSecuritiesLoading.set(false);
    });

    this.tradeService.getCashHoldings().pipe(
      switchMap(holdings => {
        const rates: Record<string, Observable<number>> = { USD: of(1) };
        for (const holding of holdings) {
          const currency = holding.currencyCode.trim().toUpperCase();
          if (!rates[currency]) {
            rates[currency] = this.usdRate(currency);
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
  @Input() dailyGainLoss: number = 1238.45;
  @Input() dailyGainLossPercentage: number = 4.55;
  @Input() totalGainLoss: number = 6892.37;
  @Input() totalGainLossPercent: number = 31.91;
}
