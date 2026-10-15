import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-forex-container',
  styleUrl: './forex-container.scss',
  templateUrl: './forex-container.html',
})
export class ForexContainer implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  baseCurrency = '';
  quoteCurrency = '';
  fromCurrencyInput = '';
  toCurrencyInput = '';
  quoteFound = false;
  searchError = '';
  showCurrencyInfo = false;
  sellAmount = 1000;
  buyAmount = 0;
  readonly rate = 0.9142;

  get displayRate(): number {
    return this.rate;
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const fromCurrency = this.normalizeCurrency(params['from']);
        const toCurrency = this.normalizeCurrency(params['to']);

        if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
          this.baseCurrency = fromCurrency;
          this.quoteCurrency = toCurrency;
          this.quoteFound = true;
        } else {
          this.baseCurrency = '';
          this.quoteCurrency = '';
          this.quoteFound = false;
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
      this.quoteFound = false;
      return;
    }

    if (fromCurrency === toCurrency) {
      this.searchError = 'Choose two different currencies.';
      this.quoteFound = false;
      return;
    }

    this.baseCurrency = fromCurrency;
    this.quoteCurrency = toCurrency;
    this.searchError = '';
    this.quoteFound = true;
    this.updateCurrencyInputs();
    this.updateAmounts();
    this.updateUrl();
  }

  switchDirection(): void {
    const from = this.baseCurrency;
    this.baseCurrency = this.quoteCurrency;
    this.quoteCurrency = from;
    this.updateCurrencyInputs();
    this.updateAmounts();
    this.updateUrl();
  }

  selectPair(baseCurrency: string, quoteCurrency: string): void {
    this.baseCurrency = baseCurrency;
    this.quoteCurrency = quoteCurrency;
    this.updateAmounts();
    this.updateUrl();
  }

  onSellAmountChange(): void {
    this.buyAmount = Number((this.sellAmount * this.displayRate).toFixed(2));
  }

  toggleCurrencyInfo(): void {
    this.showCurrencyInfo = !this.showCurrencyInfo;
  }

  private updateAmounts(): void {
    this.buyAmount = Number((this.sellAmount * this.displayRate).toFixed(2));
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
