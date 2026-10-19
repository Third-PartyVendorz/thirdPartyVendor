import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradeService } from '../../trade-page/trade.service';

@Component({
  imports: [CurrencyPipe, FormsModule],
  selector: 'app-cash-balance',
  styleUrl: './cash-balance.scss',
  templateUrl: './cash-balance.html',
})

export class CashBalance implements OnInit {
  constructor(private tradeService: TradeService) {}
  transactionType: cashTransactionType = 'DEPOSIT';
  amount = 0;
  availableBalance = signal(0);
  balanceLoading = signal(true);
  balanceError = signal(false);

  ngOnInit(): void {
    this.tradeService.getCashHoldingByCurrencyCode('USD').subscribe({
      next: (response) => {
        this.availableBalance.set(response.balance);
        this.balanceLoading.set(false);
      },
      error: (error) => {
        console.error('Error retrieving cash holding:', error);
        this.availableBalance.set(0);
        this.balanceLoading.set(false);
        this.balanceError.set(true);
      },
    });
  }

  get projectedBalance(): number {
    return this.transactionType === 'DEPOSIT' 
    ? this.availableBalance() + this.amount
    : this.availableBalance() - this.amount;
  }

  get withdrawalExceedsBalance(): boolean {
    return this.transactionType === 'WITHDRAW' && this.amount > this.availableBalance();
  }

  submitTransaction(): void {
    if (this.balanceLoading() || this.balanceError() || !this.amount || this.amount < 0 || this.withdrawalExceedsBalance) {
      return;
    }

    const payload = {
      type: this.transactionType, 
      amount: this.amount
    };
    console.log(payload);
  }
}

export type cashTransactionType = 'DEPOSIT' | 'WITHDRAW';