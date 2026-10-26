import { Component, DestroyRef, OnInit, Input, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, defer, forkJoin, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { TradeService } from '../../trade-page/trade.service';
import { MarketApiService } from '../../services/marketApi.service';
import { Holding } from '../holdings-table/holding.model';
import { OrderService } from '../../services/order.service';
import { OrderStatus } from '../../shared/order-status';
import { TradeSide } from '../../shared/trade-side';

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
    private destroyRef: DestroyRef,
    private orderService: OrderService
  ) {}
  buyingPower = signal(0);
  cashBalance = signal(0);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  securitiesValue = signal(0);
  private readonly dailySecurityGain = signal<number | null>(0);
  isSecuritiesLoading = signal(true);
  securitiesError = signal<string | null>(null);
  netPrincipal = signal(0);
  isOrdersLoading = signal(true);
  ordersError = signal<string | null>(null);
  private readonly holdingsSubject = new BehaviorSubject<Holding[]>([]);
  private readonly exchangeRates = new Map<string, Observable<number>>();

  @Input() set holdings(value: Holding[]) {
    this.holdingsSubject.next(value);
  }
  @Input() holdingsLoading = false;
  @Input() holdingsError: string | null = null;

  get portfolioValue(): number {
    return this.securitiesValue();
  }

  get dailyGainLoss(): number | null {
    if (this.holdingsLoading || this.isSecuritiesLoading() ||
        this.holdingsError || this.securitiesError()) {
      return null;
    }
    return this.dailySecurityGain();
  }

  get dailyGainLossPercentage(): number | null {
    const gain = this.dailyGainLoss;
    if (gain === null) return null;
    const previousValue = this.portfolioValue - gain;
    return previousValue > 0 ? (gain / previousValue) * 100 : gain === 0 ? 0 : null;
  }

  get totalGainLoss(): number | null {
    if (this.isOrdersLoading() || this.ordersError() || this.holdingsLoading ||
        this.holdingsError || this.isSecuritiesLoading() || this.securitiesError()) {
      return null;
    }
    return this.portfolioValue - this.netPrincipal();
  }

  get totalGainLossPercent(): number | null {
    const gain = this.totalGainLoss;
    if (gain === null) return null;
    const principal = this.netPrincipal();
    return principal > 0 ? (gain / principal) * 100 : gain === 0 && principal === 0 ? 0 : null;
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
    this.orderService.fetchOrders().pipe(
      switchMap(orders => {
        const amounts = orders.filter(order => order.status === OrderStatus.FILLED).map(order => {
          const price = order.executionPrice;
          const quantity = order.executionQuantity;
          if (price === null || !Number.isFinite(price) || price <= 0 ||
              quantity === null || !Number.isFinite(quantity) || quantity <= 0 ||
              !order.orderCurrency?.trim() ||
              (order.orderIntent !== TradeSide.BUY && order.orderIntent !== TradeSide.SELL)) {
            throw new Error(`Invalid execution data for order ${order.orderId}`);
          }
          const direction = order.orderIntent === TradeSide.BUY ? 1 : -1;
          return this.usdRate(order.orderCurrency).pipe(
            map(rate => direction * price * quantity * rate)
          );
        });
        return (amounts.length ? forkJoin(amounts) : of([] as number[])).pipe(
          map(values => values.reduce((principal, amount) => principal + amount, 0))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: principal => {
        this.netPrincipal.set(principal);
        this.isOrdersLoading.set(false);
      },
      error: () => {
        this.ordersError.set('Unable to calculate principal from executed orders.');
        this.isOrdersLoading.set(false);
      }
    });

    this.holdingsSubject.pipe(
      switchMap(holdings => defer(() => {
        this.isSecuritiesLoading.set(true);
        this.securitiesError.set(null);
        const values = holdings.map(holding => {
          if (!holding.currency?.trim() || !Number.isFinite(holding.marketValue)) {
            throw new Error(`Missing market valuation for ${holding.ticker}`);
          }
          return this.usdRate(holding.currency).pipe(
            map(rate => ({
              value: holding.marketValue! * rate,
              dailyGain: Number.isFinite(holding.change)
                ? holding.change! * rate
                : null
            }))
          );
        });
        return (values.length ? forkJoin(values) : of([])).pipe(
          map(amounts => amounts.reduce<{ value: number; dailyGain: number | null }>((total, amount) => ({
            value: total.value + amount.value,
            dailyGain: total.dailyGain === null || amount.dailyGain === null
              ? null : total.dailyGain + amount.dailyGain
          }), { value: 0, dailyGain: 0 }))
        );
      }).pipe(
        catchError(() => {
          this.securitiesError.set('Unable to value all security holdings in USD.');
          return of({ value: 0, dailyGain: null });
        })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(totals => {
      this.securitiesValue.set(totals.value);
      this.dailySecurityGain.set(totals.dailyGain);
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
}
