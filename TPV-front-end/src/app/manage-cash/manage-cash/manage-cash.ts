import { Component } from '@angular/core';
import { CashBalance } from '../cash-balance/cash-balance';
import { ForexContainer } from '../forex-container/forex-container';
import { PageHeader } from '../../shared/page-header/page-header';
import { MarketStatus } from '../../shared/market-status/market-status';

@Component({
  standalone: true,
  imports: [CashBalance, ForexContainer, PageHeader, MarketStatus],
  selector: 'app-manage-cash',
  styleUrl: './manage-cash.scss',
  templateUrl: './manage-cash.html',
})
export class ManageCash {}
