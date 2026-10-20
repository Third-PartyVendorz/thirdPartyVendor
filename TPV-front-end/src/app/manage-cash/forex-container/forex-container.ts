import { CommonModule, getCurrencySymbol } from '@angular/common';
import { Component, DestroyRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxCurrencyDirective } from 'ngx-currency';
import { MarketApiService } from '../../services/marketApi.service';
import { parseFormattedNumber } from '../../shared/utils/number-formatter';
import { MarketHistoricalCandle } from '../../dto/MarketHistoricalAPIResponse';
import { TradeService } from '../../trade-page/trade.service';
import { ForexApiService } from './forex-api.service';
import { AuthService } from '../../services/auth.service';
import { FrozenAccountModal } from '../../shared/frozen-account-modal/frozen-account-modal';

type ForexHistoricalRange = '7d' | '30d' | '1y';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, NgxCurrencyDirective, FrozenAccountModal],
  selector: 'app-forex-container',
  styleUrl: './forex-container.scss',
  templateUrl: './forex-container.html',
})
export class ForexContainer implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly marketApiService = inject(MarketApiService);
  private readonly tradeService = inject(TradeService);
  private readonly forexApiService = inject(ForexApiService);
  private readonly authService = inject(AuthService);

  baseCurrency = '';
  quoteCurrency = '';
  fromCurrencyInput = '';
  toCurrencyInput = '';
  quoteFound = signal(false);
  searchError = '';
  exchangeError = '';
  quoteLoading = signal(false);
  showCurrencyInfo = false;
  sellAmount: string | null = '0.00';
  buyAmount = signal(0);
  rate = signal(0);
  bidRate = signal(0);
  askRate = signal(0);
  spreadPercent = signal(0);
  dailyChange = signal<number | null>(null);
  dailyChangePercent = signal<number | null>(null);
  quoteAsOf = signal<string | null>(null);
  candles = signal<MarketHistoricalCandle[]>([]);
  historicalLoading = signal(false);
  historicalError = signal('');
  showConfirmation = signal(false);
  exchangeConfirmed = signal(false);
  exchangeSubmitting = signal(false);
  showFrozenAccountModal = signal(false);
  cashBalance = signal<number | null>(null);
  cashBalanceAtReview: number | null = null;
  executionError = '';
  selectedRange = signal<ForexHistoricalRange>('1y');
  readonly rangeOptions = [
    { value: '7d' as ForexHistoricalRange, label: '7D' },
    { value: '30d' as ForexHistoricalRange, label: '30D' },
    { value: '1y' as ForexHistoricalRange, label: '1Y' },
  ];

  get displayRate(): number {
    return this.rate();
  }

  get sellAmountValue(): number {
    return parseFormattedNumber(this.sellAmount);
  }

  get baseCurrencyName(): string {
    return this.currencyName(this.baseCurrency);
  }

  get quoteCurrencyName(): string {
    return this.currencyName(this.quoteCurrency);
  }

  get hasCashValidationError(): boolean {
    const balance = this.cashBalance();
    return balance !== null && (balance <= 0 || this.sellAmountValue > balance);
  }

  get accountIsFrozen(): boolean {
    return this.authService.isFrozen();
  }

  get cashValidationMessage(): string {
    const balance = this.cashBalance();
    if (balance === null) return '';
    if (balance <= 0) return `You don't own any ${this.baseCurrency}.`;
    if (this.sellAmountValue > balance) {
      return `You only have ${balance.toFixed(2)} ${this.baseCurrency} available.`;
    }
    return '';
  }

  get chartLinePoints(): string {
    const candles = this.displayedCandles;
    if (candles.length === 0) return '';

    const min = this.chartMin;
    const range = this.chartMax - min || 1;
    const step = candles.length > 1 ? 100 / (candles.length - 1) : 0;

    return candles.map((candle, index) => {
      const x = index * step;
      const y = 100 - ((candle.adjclose - min) / range) * 100;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  }

  get chartAreaPoints(): string {
    return this.chartLinePoints ? `${this.chartLinePoints} 100,100 0,100` : '';
  }

  get intervalChangePercent(): number {
    const candles = this.displayedCandles;
    if (candles.length < 2 || candles[0].adjclose <= 0) return 0;

    const firstClose = candles[0].adjclose;
    const lastClose = candles[candles.length - 1].adjclose;
    return ((lastClose - firstClose) / firstClose) * 100;
  }

  get intervalChangeAmount(): number {
    const candles = this.displayedCandles;
    if (candles.length < 2) return 0;

    return candles[candles.length - 1].adjclose - candles[0].adjclose;
  }

  get chartMin(): number {
    return this.displayedCandles.length > 0
      ? Math.min(...this.displayedCandles.map((candle) => candle.adjclose))
      : 0;
  }

  get chartMax(): number {
    return this.displayedCandles.length > 0
      ? Math.max(...this.displayedCandles.map((candle) => candle.adjclose))
      : 0;
  }

  get chartYAxisValues(): number[] {
    const step = (this.chartMax - this.chartMin || 1) / 4;
    return Array.from({ length: 5 }, (_value, index) => this.chartMax - step * index);
  }

  get chartAxisLabels(): string[] {
    const candles = this.displayedCandles;
    if (candles.length === 0) return [];

    const count = Math.min(5, candles.length);
    return Array.from({ length: count }, (_value, index) => {
      const candle = candles[Math.floor(index * (candles.length - 1) / (count - 1 || 1))];
      return this.formatAxisLabel(candle.date);
    });
  }

  get displayedCandles(): MarketHistoricalCandle[] {
    const candles = this.candles();
    if (candles.length === 0) return [];

    const latestDate = new Date(candles[candles.length - 1].date);
    const cutoffDate = new Date(latestDate);
    if (this.selectedRange() === '7d') cutoffDate.setDate(cutoffDate.getDate() - 7);
    if (this.selectedRange() === '30d') cutoffDate.setDate(cutoffDate.getDate() - 30);
    if (this.selectedRange() === '1y') cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

    return candles.filter((candle) => new Date(candle.date) >= cutoffDate);
  }

  ngOnInit(): void {
    if (this.accountIsFrozen) {
      this.showFrozenAccountModal.set(true);
    }

    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.showConfirmation.set(false);
        this.exchangeConfirmed.set(false);
        this.exchangeError = '';
        this.executionError = '';
        this.cashBalanceAtReview = null;
        const fromCurrency = this.normalizeCurrency(params['from']);
        const toCurrency = this.normalizeCurrency(params['to']);

        if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
          this.baseCurrency = fromCurrency;
          this.quoteCurrency = toCurrency;
          this.quoteFound.set(false);
          this.loadForexQuote();
        } else {
          this.baseCurrency = '';
          this.quoteCurrency = '';
          this.quoteFound.set(false);
        }

        this.updateCurrencyInputs();
        this.updateAmounts();
      });
  }

  searchCurrencies(): void {
    const fromCurrency = this.normalizeCurrency(this.fromCurrencyInput);
    const toCurrency = this.normalizeCurrency(this.toCurrencyInput);

    if (!fromCurrency || !toCurrency) {
      this.searchError = 'Enter a valid 3-letter currency code for both fields.';
      this.quoteFound.set(false);
      return;
    }

    if (fromCurrency === toCurrency) {
      this.searchError = 'Choose two different currencies.';
      this.quoteFound.set(false);
      return;
    }

    this.baseCurrency = fromCurrency;
    this.quoteCurrency = toCurrency;
    this.searchError = '';
    this.quoteFound.set(false);
    this.updateCurrencyInputs();
    this.updateUrl();
  }

  switchDirection(): void {
    const fromCurrency = this.normalizeCurrency(this.fromCurrencyInput);
    const toCurrency = this.normalizeCurrency(this.toCurrencyInput);

    if (!fromCurrency || !toCurrency) {
      const fromInput = this.fromCurrencyInput;
      this.fromCurrencyInput = this.toCurrencyInput;
      this.toCurrencyInput = fromInput;
      this.searchError = '';
      return;
    }

    if (fromCurrency === toCurrency) {
      this.searchError = 'Choose two different currencies before switching.';
      return;
    }

    this.fromCurrencyInput = toCurrency;
    this.toCurrencyInput = fromCurrency;
    this.searchError = '';
    this.searchCurrencies();
  }

  reviewExchange(): void {
    if (this.accountIsFrozen) {
      this.showFrozenAccountModal.set(true);
      return;
    }

    if (parseFormattedNumber(this.sellAmount) <= 0 || !this.quoteFound()) {
      this.exchangeError = 'Enter an amount before reviewing the exchange.';
      return;
    }

    if (this.hasCashValidationError) {
      this.exchangeError = this.cashValidationMessage;
      return;
    }

    this.exchangeError = '';
    this.checkCashBeforeReview();
  }

  confirmExchange(): void {
    if (this.accountIsFrozen) {
      this.showFrozenAccountModal.set(true);
      return;
    }

    if (this.exchangeSubmitting()) return;

    this.tradeService.getCashHoldingByCurrencyCode(this.baseCurrency)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const amount = this.sellAmountValue;
          if (this.cashBalanceAtReview !== null && response.balance < this.cashBalanceAtReview) {
            this.exchangeError = 'Your cash balance changed while reviewing this exchange. Please review it again.';
            return;
          }

          if (response.balance < amount) {
            this.exchangeError = `You only have ${response.balance.toFixed(2)} ${this.baseCurrency} available.`;
            return;
          }

          this.submitExchange();
        },
        error: () => {
          this.exchangeError = `We could not verify your ${this.baseCurrency} cash balance. Please try again.`;
        },
      });
  }

  backToExchange(): void {
    this.showConfirmation.set(false);
    this.exchangeConfirmed.set(false);
    this.executionError = '';
    this.cashBalanceAtReview = null;
  }

  selectPair(baseCurrency: string, quoteCurrency: string): void {
    this.baseCurrency = baseCurrency;
    this.quoteCurrency = quoteCurrency;
    this.updateAmounts();
    this.updateUrl();
  }

  setRange(range: ForexHistoricalRange): void {
    this.selectedRange.set(range);
  }

  onSellAmountChange(): void {
    this.exchangeError = '';
    this.buyAmount.set(Number((parseFormattedNumber(this.sellAmount) * this.displayRate).toFixed(2)));
  }

  getCurrencySymbol(): string {
    return this.baseCurrency ? getCurrencySymbol(this.baseCurrency, 'wide', 'en-US') : '';
  }

  getQuoteCurrencySymbol(): string {
    return this.quoteCurrency ? getCurrencySymbol(this.quoteCurrency, 'wide', 'en-US') : '';
  }

  toggleCurrencyInfo(): void {
    this.showCurrencyInfo = !this.showCurrencyInfo;
  }

  @HostListener('document:click', ['$event'])
  closeCurrencyInfoOnOutsideClick(event: Event): void {
    const clickedElement = event.target as HTMLElement | null;

    if (!clickedElement?.closest('.currency-info-control')) {
      this.showCurrencyInfo = false;
    }
  }

  private updateAmounts(): void {
    this.buyAmount.set(Number((parseFormattedNumber(this.sellAmount) * this.displayRate).toFixed(2)));
  }

  private loadForexQuote(): void {
    this.quoteLoading.set(true);
    this.quoteFound.set(false);
    this.quoteAsOf.set(null);
    this.candles.set([]);
    this.historicalLoading.set(false);
    this.historicalError.set('');
    this.loadCashBalance();

    this.marketApiService.fetchForexQuote(this.baseCurrency, this.quoteCurrency)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const price = response?.data?.price;

          if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
            this.searchError = 'The exchange rate response was invalid.';
            this.quoteFound.set(false);
            this.quoteLoading.set(false);
            return;
          }

          this.rate.set(price);
          this.bidRate.set(response.data.bid);
          this.askRate.set(response.data.ask);
          this.spreadPercent.set(response.data.spreadBps / 100);
          const previousClose = response.data.previousClose;
          const hasPreviousClose = Number.isFinite(previousClose) && previousClose > 0;
          const dailyChangePercent = hasPreviousClose
            ? ((price - previousClose) / previousClose) * 100
            : Number.isFinite(response.data.changePercent) ? response.data.changePercent : 0;
          const dailyChange = hasPreviousClose
            ? price - previousClose
            : price * dailyChangePercent / 100;
          this.dailyChange.set(dailyChange);
          this.dailyChangePercent.set(dailyChangePercent);
          this.quoteAsOf.set(response.data.asOf);
          this.quoteFound.set(true);
          this.quoteLoading.set(false);
          this.updateAmounts();
          this.loadHistoricalCandles();
        },
        error: () => {
          this.rate.set(0);
          this.bidRate.set(0);
          this.askRate.set(0);
          this.spreadPercent.set(0);
          this.dailyChange.set(null);
          this.dailyChangePercent.set(null);
          this.quoteAsOf.set(null);
          this.buyAmount.set(0);
          this.quoteFound.set(false);
          this.quoteLoading.set(false);
          this.historicalLoading.set(false);
          this.searchError = `Unable to load the ${this.baseCurrency}/${this.quoteCurrency} exchange rate.`;
        },
      });
  }

  private loadCashBalance(): void {
    this.cashBalance.set(null);

    this.tradeService.getCashHoldingByCurrencyCode(this.baseCurrency)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.cashBalance.set(response.balance),
        error: () => this.cashBalance.set(null),
      });
  }

  private checkCashBeforeReview(): void {
    this.tradeService.getCashHoldingByCurrencyCode(this.baseCurrency)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.balance < this.sellAmountValue) {
            this.exchangeError = `You only have ${response.balance.toFixed(2)} ${this.baseCurrency} available.`;
            return;
          }

          this.cashBalance.set(response.balance);
          this.cashBalanceAtReview = response.balance;
          this.showConfirmation.set(true);
          this.exchangeConfirmed.set(false);
        },
        error: () => {
          this.exchangeError = `We could not verify your ${this.baseCurrency} cash balance. Please try again.`;
        },
      });
  }

  private submitExchange(): void {
    if (this.accountIsFrozen) {
      this.showFrozenAccountModal.set(true);
      return;
    }

    this.exchangeSubmitting.set(true);
    this.executionError = '';

    this.forexApiService.submitExchange({
      fromCurrency: this.baseCurrency,
      toCurrency: this.quoteCurrency,
      amount: this.sellAmountValue,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.exchangeSubmitting.set(false);
        this.exchangeConfirmed.set(true);
      },
      error: () => {
        this.exchangeSubmitting.set(false);
        this.executionError = 'We could not complete the exchange. Please try again.';
      },
    });
  }

  private loadHistoricalCandles(): void {
    this.historicalLoading.set(true);
    this.historicalError.set('');

    const to = new Date();
    const from = new Date(to);
    from.setFullYear(from.getFullYear() - 1);

    this.marketApiService.fetchForexHistoricalCandles(
      this.baseCurrency,
      this.quoteCurrency,
      this.toIsoDate(from),
      this.toIsoDate(to),
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.candles.set(response.data.candles);
        this.historicalLoading.set(false);
      },
      error: () => {
        this.candles.set([]);
        this.historicalError.set('Historical exchange data is unavailable right now.');
        this.historicalLoading.set(false);
      },
    });
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private formatAxisLabel(date: string): string {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(date));
  }

  private currencyName(code: string): string {
    return code ? new Intl.DisplayNames(undefined, { type: 'currency' }).of(code) ?? code : '';
  }

  private updateCurrencyInputs(): void {
    this.fromCurrencyInput = this.baseCurrency;
    this.toCurrencyInput = this.quoteCurrency;
  }

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { from: this.baseCurrency, to: this.quoteCurrency },
      queryParamsHandling: 'merge',
    });
  }

  private normalizeCurrency(value: string | undefined): string {
    const normalizedValue = value?.trim().toUpperCase() ?? '';
    return /^[A-Z]{3}$/.test(normalizedValue) ? normalizedValue : '';
  }
}
