import { Component, Input, Output, EventEmitter, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
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

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      inputValue: ['']
    });
  }
  
  inputPlaceholder = () => {
    let placeholderString: String = "Enter a ";
    if (this.currentUnit === UnitType.SHARES) {
      placeholderString += "quantity ";
    } else {
      placeholderString += "dollar amount "
    }
    if (this.currentSide === TradeSide.BUY) {
      placeholderString += "to buy..."
    } else {
      placeholderString += "to sell..."
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

  onTradeButtonClick = (): void => {
    this.closeInsufficientFundsMessage();

    if (this.isInvalidTrade()) {
      console.warn('Trade validation failed');
      return;
    }

    const estimatedPrice = this.estimatedTotal;

    const currency = this.assetDetails?.quote?.currency || 'USD';


    if (this.currentSide === TradeSide.BUY) {
      this.tradeService.getCashHoldingByCurrencyCode(currency)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            console.log('Cash holding retrieved:', response);
            console.log("response.balance: " + response.balance);
            console.log("estimated price: " + estimatedPrice);
            if (response.balance < estimatedPrice) {
              this.displayInsufficientFundsMessage();
            } else {
              this.tradeSubmitted.emit();
            }
          },
          error: (error) => {
            console.error('Error retrieving cash holding:', error);
          }
        });
      } else {

      }
  }

  isInvalidTrade = (): boolean => {
    if (!this.assetDetails) {
      return true;
    }

    if (!this.assetDetails.quote?.price) {
      return true;
    }

    const inputValue = this.form.get('inputValue')?.value;
    
    if (!inputValue || String(inputValue).trim() === '') {
      return true;
    }

    const parsedValue = parseFormattedNumber(inputValue);

    if (isNaN(parsedValue) || parsedValue <= 0) {
      return true;
    }

    if (this.calculatedShares <= 0) {
      return true;
    }

    return false;
  }

}
