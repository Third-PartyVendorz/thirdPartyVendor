import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, Input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, defer, forkJoin, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { Holding } from '../holdings-table/holding.model';
import { MarketApiService } from '../../services/marketApi.service';
import { OrderService } from '../../services/order.service';
import { OrderStatus } from '../../shared/order-status';
import { TradeSide } from '../../shared/trade-side';

interface Allocation {
  label: string;
  value: number;
  color: string;
  percentage: number;
  path: string;
}

interface InvestmentPoint {
  date: number;
  value: number;
}

let nextChartId = 0;

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe],
  selector: 'app-portfolio-graphics',
  styleUrl: './portfolio-graphics.scss',
  templateUrl: './portfolio-graphics.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioGraphics implements OnInit {
  @Input() set holdings(value: Holding[]) {
    this.holdingsSubject.next(value);
  }
  @Input() holdingsLoading = false;
  @Input() holdingsError: string | null = null;

  readonly allocations = signal<Allocation[]>([]);
  readonly allocationLoading = signal(true);
  readonly allocationError = signal<string | null>(null);
  readonly investmentPoints = signal<InvestmentPoint[]>([]);
  readonly investmentLoading = signal(true);
  readonly investmentError = signal<string | null>(null);
  readonly totalValue = computed(() => this.allocations().reduce((sum, item) => sum + item.value, 0));
  readonly netInvestment = computed(() => this.investmentPoints().at(-1)?.value ?? 0);
  readonly gradientId = `portfolio-investment-fill-${nextChartId++}`;
  private readonly holdingsSubject = new BehaviorSubject<Holding[]>([]);
  private readonly rates = new Map<string, Observable<number>>();

  // Use actual elapsed time and a step line: capital changes only when an order is added.
  readonly trend = computed(() => {
    const points = this.investmentPoints();
    if (!points.length) return null;
    const values = points.map(point => point.value);
    const low = Math.min(0, ...values);
    const high = Math.max(0, ...values);
    const padding = Math.max((high - low) * 0.1, 1);
    const min = low - padding;
    const max = high + padding;
    const start = points[0].date;
    const end = points[points.length - 1].date;
    const x = (date: number) => end === start ? 320 : 16 + (date - start) / (end - start) * 608;
    const y = (value: number) => 16 + (max - value) / (max - min) * 248;
    const dots = points.map(point => ({ ...point, x: x(point.date), y: y(point.value) }));
    const line = dots.map((point, index) => index === 0
      ? `M ${point.x} ${point.y}` : `H ${point.x} V ${point.y}`).join(' ');
    return {
      dots,
      line,
      area: `${line} L ${dots[dots.length - 1].x} ${y(0)} L ${dots[0].x} ${y(0)} Z`,
      ticks: Array.from({ length: 5 }, (_, index) => ({
        value: max - (max - min) * index / 4,
        y: 16 + 248 * index / 4,
      })),
      start,
      end,
    };
  });

  constructor(
    private readonly marketApi: MarketApiService,
    private readonly orderService: OrderService,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.holdingsSubject.pipe(
      switchMap(holdings => defer(() => {
        this.allocationLoading.set(true);
        this.allocationError.set(null);
        this.allocations.set([]);
        const requests = holdings.filter(holding => holding.numShares !== 0).map(holding => {
          if (!Number.isFinite(holding.marketValue) || holding.marketValue! < 0 ||
              !Number.isFinite(holding.numShares) || holding.numShares < 0) {
            throw new Error('Missing or unsupported holding valuation');
          }
          return this.usdRate(holding.currency).pipe(map(rate => ({
            label: this.securityType(holding.assetType),
            value: holding.marketValue! * rate,
          })));
        });
        return requests.length ? forkJoin(requests) : of([]);
      }).pipe(catchError(() => {
        this.allocationError.set('Unable to value all holdings in USD. Allocation is unavailable.');
        return of([]);
      }))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(values => {
      const groups = new Map<string, number>();
      values.forEach(item => groups.set(item.label, (groups.get(item.label) ?? 0) + item.value));
      const total = values.reduce((sum, item) => sum + item.value, 0);
      const colors: Record<string, string> = {
        Equities: '#0b5ca5', Crypto: '#2f9c99', 'Mutual funds': '#8b5cf6',
        ETFs: '#e5a22e', Bonds: '#d46b8c', Other: '#64748b',
      };
      let angle = -Math.PI / 2;
      this.allocations.set([...groups.entries()]
        .filter(([, value]) => value > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([label, value]) => {
          const fraction = value / total;
          const start = angle;
          angle += fraction * Math.PI * 2;
          return { label, value, color: colors[label], percentage: fraction * 100,
            path: this.pieSlice(start, angle, fraction === 1) };
        }));
      this.allocationLoading.set(false);
    });

    this.orderService.fetchOrders().pipe(
      switchMap(orders => {
        const requests = orders.filter(order => order.status === OrderStatus.FILLED).map(order => {
          const price = order.executionPrice;
          const quantity = order.executionQuantity;
          const date = Date.parse(order.createdAt);
          if (price === null || !Number.isFinite(price) || price <= 0 ||
              quantity === null || !Number.isFinite(quantity) || quantity <= 0 ||
              !Number.isFinite(date) ||
              (order.orderIntent !== TradeSide.BUY && order.orderIntent !== TradeSide.SELL)) {
            throw new Error('Incomplete execution data');
          }
          return this.usdRate(order.orderCurrency).pipe(map(rate => ({
            date: Date.UTC(new Date(date).getUTCFullYear(), new Date(date).getUTCMonth(), new Date(date).getUTCDate()),
            value: price * quantity * rate * (order.orderIntent === TradeSide.BUY ? 1 : -1),
          })));
        });
        return requests.length ? forkJoin(requests) : of([]);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: amounts => {
        const days = new Map<number, number>();
        amounts.forEach(item => days.set(item.date, (days.get(item.date) ?? 0) + item.value));
        let total = 0;
        this.investmentPoints.set([...days.entries()].sort((a, b) => a[0] - b[0])
          .map(([date, value]) => ({ date, value: total += value })));
        this.investmentLoading.set(false);
      },
      error: () => {
        this.investmentError.set('Unable to load complete investment history. Please try again later.');
        this.investmentLoading.set(false);
      },
    });
  }

  private usdRate(code: string): Observable<number> {
    const currency = code?.trim().toUpperCase();
    if (!currency) throw new Error('Missing currency');
    if (currency === 'USD') return of(1);
    let rate = this.rates.get(currency);
    if (!rate) {
      rate = this.marketApi.fetchForexQuote(currency, 'USD').pipe(
        map(response => {
          if (!Number.isFinite(response.data.price) || response.data.price <= 0) {
            throw new Error('Invalid exchange rate');
          }
          return response.data.price;
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
      this.rates.set(currency, rate);
    }
    return rate;
  }

  private securityType(type: string): string {
    switch (type?.toUpperCase().replace(/[\s_-]/g, '')) {
      case 'STOCK': case 'STOCKS': case 'EQUITY': case 'EQUITIES': return 'Equities';
      case 'CRYPTO': case 'CRYPTOCURRENCY': case 'CRYPTOCURRENCIES': return 'Crypto';
      case 'MUTUALFUND': case 'MUTUALFUNDS': return 'Mutual funds';
      case 'ETF': case 'ETFS': return 'ETFs';
      case 'BOND': case 'BONDS': case 'FIXEDINCOME': return 'Bonds';
      default: return 'Other';
    }
  }

  private pieSlice(start: number, end: number, fullCircle: boolean): string {
    if (fullCircle) return 'M 140 20 A 120 120 0 1 1 140 260 A 120 120 0 1 1 140 20 Z';
    const point = (angle: number) => `${140 + 120 * Math.cos(angle)} ${140 + 120 * Math.sin(angle)}`;
    return `M 140 140 L ${point(start)} A 120 120 0 ${end - start > Math.PI ? 1 : 0} 1 ${point(end)} Z`;
  }
}
