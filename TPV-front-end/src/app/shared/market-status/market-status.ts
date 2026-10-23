import { DatePipe, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-market-status',
  standalone: true,
  imports: [DatePipe, NgClass],
  templateUrl: './market-status.html',
  styleUrl: './market-status.scss',
})
export class MarketStatus implements OnDestroy, OnInit {
  marketOpen = false;
  lastUpdated = new Date();

  private readonly marketTimeZone = 'America/New_York';
  private statusTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.updateMarketStatus();
    this.statusTimer = setInterval(() => this.updateMarketStatus(), 60_000);
  }

  ngOnDestroy(): void {
    if (this.statusTimer) {
      clearInterval(this.statusTimer);
    }
  }

  private isMarketOpen(): boolean {
    const easternTime = new Intl.DateTimeFormat('en-US', {
      timeZone: this.marketTimeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());

    const weekday = easternTime.find((part) => part.type === 'weekday')?.value;
    const hours = Number(easternTime.find((part) => part.type === 'hour')?.value);
    const minutes = Number(easternTime.find((part) => part.type === 'minute')?.value);
    const currentTime = hours * 100 + minutes;
    const isWeekday = weekday !== 'Sat' && weekday !== 'Sun';

    return isWeekday && currentTime >= 930 && currentTime < 1600;
  }

  private updateMarketStatus(): void {
    this.marketOpen = this.isMarketOpen();
    this.lastUpdated = new Date();
  }
}
