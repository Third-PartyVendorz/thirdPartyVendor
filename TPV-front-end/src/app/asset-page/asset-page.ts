import { CurrencyPipe, DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketQuoteData } from '../dto/MarketQuoteAPIResponse';
import { MarketSymbolData } from '../dto/MarketSymbolAPIResponse';
import { MarketApiService } from '../services/marketApi.service';
import { ErrorService } from '../services/error.service';
import { forkJoin, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type HistoricalCandle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjclose: number;
  volume: number;
  synthetic: boolean;
};

type HistoricalRange = '7d' | '30d' | '1y';

type HistoricalRangeOption = {
  value: HistoricalRange;
  label: string;
};

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, NgFor, NgIf, Navbar],
  selector: 'app-asset-page',
  styleUrl: './asset-page.scss',
  templateUrl: './asset-page.html',
})

export class AssetPage implements OnInit {

  private route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private symbol = '';

  readonly quote = signal<MarketQuoteData | null>(null);
  readonly asset = signal<MarketSymbolData | null>(null);
  readonly candles = signal<HistoricalCandle[]>([]);
  readonly selectedRange = signal<HistoricalRange>('1y');

  readonly rangeOptions: HistoricalRangeOption[] = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '1y', label: '1Y' },
  ];

  readonly loading = signal(true);
  readonly historicalLoading = signal(true);
  readonly notFound = signal(false);
  readonly errorMessage = signal('');
  readonly historicalError = signal('');

  readonly historicalTo = this.toIsoDate(new Date());
  readonly historicalFrom = this.toIsoDate(this.shiftDate(new Date(), -365));

  constructor(
    private marketApiService: MarketApiService,
    private errorService: ErrorService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.errorService.clearErrorMessage();
    this.route.paramMap
      .pipe(
        map((params) => params.get('ticker')?.trim().toUpperCase() ?? ''),
        filter((ticker) => ticker.length > 0),
        distinctUntilChanged(),
        switchMap((ticker) => this.loadTicker(ticker)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private loadTicker(ticker: string) {
    this.symbol = ticker;
    this.resetState();

    return forkJoin({
      quote: this.marketApiService.fetchQuote(ticker).pipe(
        catchError((error) => {
          if (error.status === 404) {
            this.notFound.set(true);
          }
          this.errorMessage.set('Unable to load the latest quote data.');
          this.errorService.setErrorMessage('Unable to load the latest quote data.');
          return of(null);
        }),
      ),
      asset: this.marketApiService.fetchAssetInfo(ticker).pipe(
        catchError((error) => {
          if (error.status === 404) {
            this.notFound.set(true);
          }
          this.errorMessage.set('Unable to load the asset data.');
          this.errorService.setErrorMessage('Unable to load the asset data.');
          return of(null);
        }),
      ),
      candles: this.marketApiService.fetchHistoricalCandles(ticker, this.historicalFrom, this.historicalTo).pipe(
        catchError(() => {
          this.historicalError.set('Historical data is unavailable right now.');
          this.errorService.setErrorMessage('Historical data is unavailable right now.');
          return of(null);
        }),
      ),
    }).pipe(
      tap(({ quote, asset, candles }) => {
        if (quote) {
          this.quote.set(quote.data);
        }

        if (asset) {
          this.asset.set(asset.data);
        }

        if (candles) {
          this.candles.set(candles.data.candles);
        }

        this.loading.set(false);
        this.historicalLoading.set(false);
      }),
    );
  }

  private resetState(): void {
    this.quote.set(null);
    this.asset.set(null);
    this.candles.set([]);
    this.loading.set(true);
    this.historicalLoading.set(true);
    this.notFound.set(false);
    this.errorMessage.set('');
    this.historicalError.set('');
  }

  onTickerResubmit(value: string): void {
    const ticker = value.trim().toUpperCase();
    if (ticker) {
      this.router.navigate(['/assets', ticker]);
    }
  }

  get chartLinePoints(): string {
    return this.buildLinePoints();
  }

  get chartAreaPoints(): string {
    return this.buildAreaPoints();
  }

  get hasHistoricalData(): boolean {
    return this.displayedCandles.length > 0;
  }

  get chartMin(): number {
    const values = this.displayedCandles.map((candle) => candle.adjclose);
    return values.length > 0 ? Math.min(...values) : 0;
  }

  get chartYAxisValues(): number[] {
    const candles = this.displayedCandles;
    if (candles.length === 0) {
      return [];
    }

    const tickCount = 5;
    const minValue = this.chartMin;
    const maxValue = this.chartMax;
    const valueRange = maxValue - minValue || 1;

    return Array.from({ length: tickCount }, (_value, index) => {
      const ratio = 1 - index / (tickCount - 1);
      return minValue + valueRange * ratio;
    });
  }

  get chartMax(): number {
    const values = this.displayedCandles.map((candle) => candle.adjclose);
    return values.length > 0 ? Math.max(...values) : 0;
  }

  get latestCandle(): HistoricalCandle | null {
    const candles = this.displayedCandles;
    return candles.length > 0 ? candles[candles.length - 1] : null;
  }

  get latestVolumeCandle(): HistoricalCandle | null {
    const candles = [...this.displayedCandles].reverse();
    return candles.find((candle) => candle.volume > 0) ?? this.latestCandle;
  }

  get historicalRangeLabel(): string {
    const candles = this.displayedCandles;
    if (candles.length === 0) {
      return 'No history loaded';
    }

    const rangeLabels: Record<HistoricalRange, string> = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '1y': 'Last 1 year',
    };

    return `${rangeLabels[this.selectedRange()]} • ${this.formatDate(candles[0].date)} - ${this.formatDate(candles[candles.length - 1].date)}`;
  }

  get chartAxisLabels(): string[] {
    const candles = this.displayedCandles;
    if (candles.length === 0) {
      return [];
    }

    switch (this.selectedRange()) {
      case '7d':
        return candles.map((candle) => this.formatAxisLabel(candle.date));
      case '30d':
        return this.buildSampledAxisLabels(candles, 3);
      case '1y':
      default:
        return this.buildMonthlyAxisLabels(candles);
    }
  }

  get chartAxisGridColumns(): string {
    const labelCount = this.chartAxisLabels.length;
    return labelCount > 0 ? `repeat(${labelCount}, minmax(0, 1fr))` : 'repeat(1, minmax(0, 1fr))';
  }

  get recentCandles(): HistoricalCandle[] {
    return this.displayedCandles.slice(-10).reverse();
  }

  get displayedCandles(): HistoricalCandle[] {
    const candles = this.candles();

    if (candles.length === 0) {
      return [];
    }

    const latest = candles[candles.length - 1];
    const latestDate = new Date(latest.date);
    const cutoffDate = new Date(latestDate);

    switch (this.selectedRange()) {
      case '7d':
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        break;
      case '1y':
      default:
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
    }

    return candles.filter((candle) => new Date(candle.date) >= cutoffDate);
  }

  setRange(range: HistoricalRange): void {
    this.selectedRange.set(range);
  }

  private buildLinePoints(): string {
    const candles = this.displayedCandles;
    if (candles.length === 0) {
      return '';
    }

    const width = 100;
    const height = 100;
    const minValue = this.chartMin;
    const maxValue = this.chartMax;
    const valueRange = maxValue - minValue || 1;
    const step = candles.length > 1 ? width / (candles.length - 1) : 0;

    return candles
      .map((point, index) => {
        const x = index * step;
        const normalized = (point.adjclose - minValue) / valueRange;
        const y = height - normalized * height;

        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }

  private buildAreaPoints(): string {
    const points = this.buildLinePoints();
    if (!points) {
      return '';
    }

    return `0,100 ${points} 100,100`;
  }

  private formatAxisLabel(date: string): string {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date));
  }

  private buildSampledAxisLabels(candles: HistoricalCandle[], stepSize: number): string[] {
    const labels: string[] = [];

    for (let index = 0; index < candles.length; index += stepSize) {
      labels.push(this.formatAxisLabel(candles[index].date));
    }

    const lastLabel = this.formatAxisLabel(candles[candles.length - 1].date);
    if (labels[labels.length - 1] !== lastLabel) {
      labels.push(lastLabel);
    }

    return labels;
  }

  private buildMonthlyAxisLabels(candles: HistoricalCandle[]): string[] {
    const labels: string[] = [];
    let currentMonth = '';

    for (const candle of candles) {
      const monthKey = candle.date.slice(0, 7);
      if (monthKey !== currentMonth) {
        labels.push(new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(new Date(candle.date)));
        currentMonth = monthKey;
      }
    }

    const lastLabel = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(new Date(candles[candles.length - 1].date));
    if (labels[labels.length - 1] !== lastLabel) {
      labels.push(lastLabel);
    }

    return labels;
  }

  private formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private shiftDate(date: Date, days: number): Date {
    const shifted = new Date(date);
    shifted.setDate(shifted.getDate() + days);
    return shifted;
  }
}