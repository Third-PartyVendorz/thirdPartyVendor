import { Component, Input, Output, EventEmitter, inject, DestroyRef, ChangeDetectorRef, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule, getCurrencySymbol } from '@angular/common';
import { Router } from '@angular/router';
import { TradeSide } from '../../shared/trade-side';
import { AssetTradeDetails } from '../../asset-result/asset-result';
import { CustomSliderComponent } from '../../shared/custom-slider/custom-slider';
import { NgxCurrencyDirective } from "ngx-currency";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { parseFormattedNumber, stripTrailingZeros, addCommasToNumber, validateAndFormatDecimalInput } from '../../shared/utils/number-formatter';
import { TradeService } from '../trade.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderResponse } from '../../dto/OrderResponse';
import { OrderRequest } from '../../dto/OrderRequest';

enum UnitType {
  SHARES = "SHARES",
  DOLLARS = "DOLLARS"
}

@Component({
  selector: 'app-trade-form-selector',
  standalone: true,
  imports: [CommonModule, CustomSliderComponent, NgxCurrencyDirective, FormsModule, ReactiveFormsModule],
  templateUrl: './trade-form.component.html',
  styleUrl: './trade-form.component.scss',
})
export class TradeFormComponent implements OnInit {

  @Input() ticker = '';
  @Input() assetDetails: AssetTradeDetails | null = null;
  @Output() tradeSubmitted = new EventEmitter<void>();
  @Output() summaryToggled = new EventEmitter<boolean>();

  @ViewChild('formContainer') formContainer!: ElementRef;

  private tradeService: TradeService = inject(TradeService);
  private destroyRef: DestroyRef = inject(DestroyRef);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private router: Router = inject(Router);

  TradeSide = TradeSide;
  UnitType = UnitType;

  form: FormGroup;

  currentSide: TradeSide = TradeSide.BUY;
  currentUnit: UnitType = UnitType.SHARES;
  showOrderSummaryPanel: boolean = false;
  showBuyingPowerChangedModal: boolean = false;
  showSharesOwnedChangedModal: boolean = false;
  isSubmittingOrder: boolean = false;
  orderSubmitted: boolean = false;
  orderError: boolean = false;
  orderErrorMessage: string = '';
  submittedOrderResponse: OrderResponse | null = null;

  currency: string = 'USD';
  buyingPower: number = 0;
  buyingPowerAtOrderSummaryOpen: number = 0;
  hasCurrency: boolean | null = null;

  sharesOwned: number = 0;
  sharedOwnedAtOrderSummaryOpen: number = 0;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      inputValue: ['']
    });
  }

  ngOnInit(): void {
    if (!this.assetDetails?.quote?.currency) {
      console.warn('AssetDetails or currency not available in trade form - defaulting to USD');
    }
    this.currency = this.assetDetails?.quote?.currency ?? 'USD';

    this.tradeService.getCashHoldingByCurrencyCode(this.currency)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.buyingPower = response.balance;
          this.hasCurrency = response.balance > 0;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error retrieving cash holding:', error);
          this.buyingPower = 0;
          this.hasCurrency = false;
          this.cdr.markForCheck();
        }
      });

    this.tradeService.getQuantitySharesOwned(this.ticker)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.sharesOwned = response.numShares;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error retrieving shares owned:', error);
          this.sharesOwned = 0;
          this.cdr.markForCheck();
        }
      });
  }

  inputPlaceholder = () => {
    let placeholderString: String = "Enter a ";
    if (this.currentUnit === UnitType.SHARES) {
      placeholderString += "quantity ";
    } else {
      placeholderString += "dollar amount ";
    }
    if (this.currentSide === TradeSide.BUY) {
      placeholderString += "to buy...";
    } else {
      placeholderString += "to sell...";
    }
    return placeholderString;
  }

  get calculatedShares(): number {
    const inputValue = this.form.get('inputValue')?.value;
    const rawVal = parseFormattedNumber(inputValue);
    if (rawVal <= 0) return 0;

    if (this.currentUnit === UnitType.SHARES) {
      return rawVal;
    }

    const price = this.assetDetails?.quote?.price;
    return price ? rawVal / price : 0;
  }

  get formattedShares(): string {
    const shares = this.calculatedShares;
    if (!shares) return '0';

    const trimmedShares = stripTrailingZeros(shares, 4);
    return addCommasToNumber(trimmedShares);
  }

  get estimatedTotal(): number {
    const price = this.assetDetails?.quote?.price || 0;
    
    if (this.currentUnit === UnitType.DOLLARS) {
      const inputValue = this.form.get('inputValue')?.value;
      return parseFormattedNumber(inputValue);
    }

    return this.calculatedShares * price;
  }

  clearValueInput = () => this.form.get('inputValue')?.setValue(null);

  getInputValue = () => this.form.get('inputValue')?.value;

  getCurrencySymbol(): string {
    return getCurrencySymbol(this.currency, 'wide', 'en-US');
  }

  validateDecimalInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = validateAndFormatDecimalInput(input.value, 4);
    this.form.get('inputValue')?.setValue(formattedValue, { emitEvent: false });
  }


  closeOrderSummaryPanel(): void {
    this.showOrderSummaryPanel = false;
    this.summaryToggled.emit(false);
    this.cdr.markForCheck();
  }

  closeBuyingPowerChangedModal(): void {
    this.showBuyingPowerChangedModal = false;
    this.closeOrderSummaryPanel();
    this.cdr.markForCheck();
  }

  closeSharesOwnedChangedModal(): void {
    this.showSharesOwnedChangedModal = false;
    this.closeOrderSummaryPanel();
    this.cdr.markForCheck();
  }


  get hasInsufficientFunds(): boolean {
    if (this.currentSide !== TradeSide.BUY) {
      return false;
    }
    
    if (this.estimatedTotal <= 0) {
      return false;
    }
    
    return this.estimatedTotal > this.buyingPower;
  }

  get shouldShowInsufficientFundsMessage(): boolean {
    return this.hasInsufficientFunds;
  }

  get hasInsufficientShares(): boolean {
    if (this.currentSide !== TradeSide.SELL) {
      return false;
    }
    
    return this.calculatedShares > this.sharesOwned;
  }

  get shouldShowInsufficientSharesMessage(): boolean {
    return this.hasInsufficientShares;
  }

  onContinueToOrderSummary = (): void => {
    if (this.isInvalidTrade()) {
      console.warn('Trade validation failed');
      return;
    }

    this.buyingPowerAtOrderSummaryOpen = this.buyingPower;
    this.sharedOwnedAtOrderSummaryOpen = this.sharesOwned;
    this.showOrderSummaryPanel = true;
    this.summaryToggled.emit(true);
    this.cdr.markForCheck();
  }

  onPlaceOrder = (): void => {
    if (this.isInvalidTrade()) {
      console.warn('Trade validation failed');
      return;
    }

    if (this.currentSide === TradeSide.BUY) {
      this.tradeService.getCashHoldingByCurrencyCode(this.currency)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            if (response.balance < this.buyingPowerAtOrderSummaryOpen) {
              this.buyingPower = response.balance;
              this.showBuyingPowerChangedModal = true;
              this.cdr.markForCheck();
              return;
            }

            if (response.balance < this.estimatedTotal) {
              this.closeOrderSummaryPanel();
            } else {
              this.submitOrder();
            }
          },
          error: (error) => {
            console.error('Error retrieving cash holding:', error);
          }
        });
    } else {
      this.tradeService.getQuantitySharesOwned(this.ticker)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            if (response.numShares < this.sharedOwnedAtOrderSummaryOpen) {
              this.sharesOwned = response.numShares;
              this.showSharesOwnedChangedModal = true;
              this.cdr.markForCheck();
              return;
            }

            if (response.numShares < this.calculatedShares) {
              this.closeOrderSummaryPanel();
            } else {
              this.submitOrder();
            }
          },
          error: (error) => {
            console.error('Error retrieving cash holding:', error);
          }
        });
    }
  }

  isInvalidTrade = (): boolean => {
    if (!this.assetDetails || !this.assetDetails.quote?.price) {
      return true;
    }

    const inputValue = this.form.get('inputValue')?.value;
    
    if (!inputValue || String(inputValue).trim() === '') {
      return true;
    }

    const parsedValue = parseFormattedNumber(inputValue);

    if (isNaN(parsedValue) || parsedValue <= 0 || this.calculatedShares <= 0 || this.hasInsufficientFunds || this.hasInsufficientShares) {
      return true;
    }

    return false;
  }

  submitOrder = (): void => {
    const orderRequest: OrderRequest = {
      symbol: this.ticker,
      side: this.currentSide,
      quantity: this.calculatedShares,
      price: this.assetDetails?.quote?.price || 0,
      currency: this.currency
    };

    this.showOrderSummaryPanel = false;

    this.isSubmittingOrder = true;
    this.orderSubmitted = false;
    this.orderError = false;
    this.orderErrorMessage = '';
    this.cdr.markForCheck();

    this.tradeService.postOrder(orderRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: OrderResponse) => {
          this.isSubmittingOrder = false;
          this.orderSubmitted = true;
          this.submittedOrderResponse = response;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isSubmittingOrder = false;
          this.orderError = true;
          this.orderErrorMessage = error.message || 'Order submission failed. Please try again.';
          this.cdr.markForCheck();
        }
      });
  }

  resetOrderState = (): void => {
    this.isSubmittingOrder = false;
    this.orderSubmitted = false;
    this.orderError = false;
    this.orderErrorMessage = '';
    this.submittedOrderResponse = null;
    this.cdr.markForCheck();
  }

  navigateToDashboard = (): void => {
    this.resetOrderState();
    this.summaryToggled.emit(false);
    this.tradeSubmitted.emit();
    this.router.navigate(['/dashboard']);
  }

  navigateToForex = (): void => {
    this.router.navigate(['/forex'], { queryParams: { from: this.currency, to: this.currency } });
  }

  navigateToFunding = (): void => {
    this.router.navigate(['/funding']);
  }
}

