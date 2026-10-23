import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradeService } from '../../trade-page/trade.service';
import { MessageService } from '../../services/message.service';

@Component({
  imports: [CurrencyPipe, FormsModule],
  selector: 'app-cash-balance',
  styleUrl: './cash-balance.scss',
  templateUrl: './cash-balance.html',
})

export class CashBalance implements OnInit {
  constructor(
    private tradeService: TradeService,
    private messageService: MessageService,
  ) {}
  transactionType: cashTransactionType = 'DEPOSIT';
  amount: number | null = null;
  availableBalance = signal(0);
  buyingPower = signal(0);
  balanceLoading = signal(true);
  balanceError = signal(false);
  transactionSubmitting = signal(false);
  transactionError = signal(false);

  ngOnInit(): void {
    this.tradeService.getCashHoldingByCurrencyCode('USD').subscribe({
      next: (response) => {
        this.availableBalance.set(response.balance);
        this.buyingPower.set(response.buyingPower);
        this.balanceLoading.set(false);
      },
      error: (error) => {
        console.error('Error retrieving cash holding:', error);
        this.availableBalance.set(0);
        this.buyingPower.set(0);
        this.balanceLoading.set(false);
        this.balanceError.set(true);
      },
    });
  }

  get projectedBalance(): number {
    const amount = this.amount ?? 0;

    return this.transactionType === 'DEPOSIT' 
    ? this.availableBalance() + amount
    : this.availableBalance() - amount;
  }

  get withdrawalExceedsBalance(): boolean {
    return this.transactionType === 'WITHDRAW' && (this.amount ?? 0) > this.buyingPower();
  }

  submitTransaction(): void {
    if (this.balanceLoading() || this.balanceError() || this.transactionSubmitting() || !this.amount || this.amount < 0 || this.withdrawalExceedsBalance) {
      return;
    }

    this.transactionSubmitting.set(true);
    this.transactionError.set(false);
    this.messageService.clearMessage();

    const transactionLabel = this.transactionType === 'DEPOSIT' ? 'Deposit' : 'Withdrawal';
    const transactionAmount = this.amount;

    this.tradeService.postCashTransaction({
      currencyCode: 'USD',
      type: this.transactionType,
      amount: this.amount,
    }).subscribe({
      next: (response) => {
        this.availableBalance.set(response.balance);
        this.buyingPower.set(response.buyingPower);
        this.amount = 0;
        this.transactionSubmitting.set(false);
        this.messageService.setSuccessMessage(
          `${transactionLabel} of $${transactionAmount.toFixed(2)} completed successfully.`,
        );
      },
      error: (error) => {
        console.error('Error submitting cash transaction:', error);
        this.transactionSubmitting.set(false);
        this.transactionError.set(true);
        this.messageService.setErrorMessage(
          error?.error?.message ?? `Unable to complete the ${transactionLabel.toLowerCase()}.`,
        );
      },
    });
  }
}

export type cashTransactionType = 'DEPOSIT' | 'WITHDRAW';