import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CurrencyPipe, FormsModule],
  selector: 'app-cash-balance',
  styleUrl: './cash-balance.scss',
  templateUrl: './cash-balance.html',
})

export class CashBalance {
  transactionType: cashTransactionType = 'DEPOSIT';
  selectedAccount = 'Chase Bank (**5432)';
  amount = 0;
  availableBalance = 12500;

  get projectedBalance(): number {
    return this.transactionType === 'DEPOSIT' 
    ? this.availableBalance + this.amount 
    : this.availableBalance - this.amount; 
  }

  submitTransaction(): void {
    const payload = {
      type: this.transactionType, 
      account: this.selectedAccount,
      amount: this.amount
    };
    console.log(payload);
  }
}


export type cashTransactionType = 'DEPOSIT' | 'WITHDRAW';