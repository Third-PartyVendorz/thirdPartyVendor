import { Component } from '@angular/core';
import { CashBalance } from '../cash-balance/cash-balance';
import { NgClass } from '@angular/common';
import { DatePipe } from '@angular/common';

@Component({
  imports: [CashBalance, NgClass, DatePipe],
  selector: 'app-manage-cash',
  styleUrl: './manage-cash.scss',
  templateUrl: './manage-cash.html',
})
export class ManageCash {
  marketOpen = false;
  lastUpdated = new Date();
}
