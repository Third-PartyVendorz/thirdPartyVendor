import { Component } from '@angular/core';
import { CashBalance } from '../cash-balance/cash-balance';
import { NgClass } from '@angular/common';
import { DatePipe } from '@angular/common';
import { OnDestroy, OnInit } from '@angular/core';

@Component({
  imports: [CashBalance, NgClass, DatePipe],
  selector: 'app-manage-cash',
  styleUrl: './manage-cash.scss',
  templateUrl: './manage-cash.html',
})
export class ManageCash implements OnDestroy, OnInit {
  marketOpen = false;
  lastUpdated = new Date();

  private readonly marketTimeZone = 'America/New_York';
  private statusTimer?: ReturnType<typeof setInterval>;

  private isMarketOpen(): boolean {
    const now = new Date();
    const easternTime = new Intl.DateTimeFormat('en-US', {
      timeZone: this.marketTimeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now);

    const weekday = easternTime.find((part) => part.type === 'weekday')?.value;
    const hours = Number(easternTime.find((part) => part.type === 'hour')?.value);
    const minutes = Number(easternTime.find((part) => part.type === 'minute')?.value);
    const currentTime = hours * 100 + minutes;
    const isWeekday = weekday !== 'Sat' && weekday !== 'Sun';

    // Regular US market hours are 9:30 AM to 4:00 PM Eastern Time.
    return isWeekday && currentTime >= 930 && currentTime < 1600;
  }

  ngOnInit(): void {
    this.updateMarketStatus();
    this.statusTimer = setInterval(() => this.updateMarketStatus(), 60_000);
  }

  ngOnDestroy(): void {
    if (this.statusTimer) {
      clearInterval(this.statusTimer);
    }
  }

  private updateMarketStatus(): void {
    this.marketOpen = this.isMarketOpen();
    this.lastUpdated = new Date();
  }
}
