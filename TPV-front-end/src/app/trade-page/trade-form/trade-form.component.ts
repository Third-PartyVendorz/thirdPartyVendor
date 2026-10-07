import { Component, Input, Output, EventEmitter, inject, DestroyRef, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeSide } from '../../shared/trade-side';
import { AssetTradeDetails } from '../../asset-result/asset-result';
import { CustomSliderComponent } from '../../shared/custom-slider/custom-slider';
import { NgxCurrencyDirective } from "ngx-currency";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { parseFormattedNumber, stripTrailingZeros, addCommasToNumber, validateAndFormatDecimalInput } from '../../shared/utils/number-formatter';
import { TradeService } from '../trade.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class TradeFormComponent {

  @Input() ticker = '';
  @Input() assetDetails: AssetTradeDetails | null = null;
  @Output() tradeSubmitted = new EventEmitter<void>();
  @Output() summaryToggled = new EventEmitter<boolean>();

  @ViewChild('formContainer') formContainer!: ElementRef;

  private tradeService: TradeService = inject(TradeService);
  private destroyRef: DestroyRef = inject(DestroyRef);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  TradeSide = TradeSide;
  UnitType = UnitType;

  form: FormGroup;

  currentSide: TradeSide = TradeSide.BUY;
  currentUnit: UnitType = UnitType.SHARES;
  showInsufficientFundsMessage: boolean = false;
  showInsufficientSharesMessage: boolean = false;
  showOrderSummaryPanel: boolean = false;

  currency: string;
  buyingPower: number = 0;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      inputValue: ['']
    });
    this.currency = this.assetDetails?.quote?.currency || 'USD';
    this.tradeService.getCashHoldingByCurrencyCode(this.currency)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.buyingPower = response.balance;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error retrieving cash holding:', error);
          this.buyingPower = 0;
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

  validateDecimalInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = validateAndFormatDecimalInput(input.value, 4);
    this.form.get('inputValue')?.setValue(formattedValue, { emitEvent: false });
  }

  displayInsufficientFundsMessage(): void {
    this.showInsufficientFundsMessage = true;
    this.cdr.markForCheck();
  }

  displayInsufficientSharesMessage(): void {
    this.showInsufficientSharesMessage = true;
    this.cdr.markForCheck();
  }

  closeInsufficientFundsMessage(): void {
    this.showInsufficientFundsMessage = false;
  }

  closeInsufficientSharesMessage(): void { 
    this.showInsufficientSharesMessage = false;
  }

  closeOrderSummaryPanel(): void {
    this.showOrderSummaryPanel = false;
    this.summaryToggled.emit(false);
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

  onContinueToOrderSummary = (): void => {
    if (this.isInvalidTrade()) {
      console.warn('Trade validation failed');
      return;
    }

    const estimatedPrice = this.estimatedTotal;

    if (this.currentSide === TradeSide.BUY) {
      this.tradeService.getCashHoldingByCurrencyCode(this.currency)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            if (response.balance < estimatedPrice) {
              this.displayInsufficientFundsMessage();
            } else {
              this.showOrderSummaryPanel = true;
              this.summaryToggled.emit(true);
              this.cdr.markForCheck();
            }
          },
          error: (error) => {
            console.error('Error retrieving cash holding:', error);
          }
        });
    } else {
      this.showOrderSummaryPanel = true;
      this.summaryToggled.emit(true);
      this.cdr.markForCheck();
    }
  }

  onPlaceTradeFromPanel = (): void => {
    if (this.isInvalidTrade()) {
      console.warn('Trade validation failed');
      return;
    }

    const estimatedPrice = this.estimatedTotal;

    if (this.currentSide === TradeSide.BUY) {
      this.tradeService.getCashHoldingByCurrencyCode(this.currency)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            if (response.balance < estimatedPrice) {
              this.displayInsufficientFundsMessage();
              this.closeOrderSummaryPanel();
            } else {
              this.summaryToggled.emit(false);
              this.tradeSubmitted.emit();
            }
          },
          error: (error) => {
            console.error('Error retrieving cash holding:', error);
          }
        });
    } else {
      this.summaryToggled.emit(false);
      this.tradeSubmitted.emit();
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

    if (isNaN(parsedValue) || parsedValue <= 0 || this.calculatedShares <= 0 || this.hasInsufficientFunds) {
      return true;
    }

    return false;
  }
}