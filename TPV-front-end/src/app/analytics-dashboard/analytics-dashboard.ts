import { CurrencyPipe, NgFor, NgIf, CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';

import { Navbar } from './../navbar/navbar';
import { AnalyticsResponse } from '../dto/AnalyticsResponse';
import { AnalyticsService } from '../services/analytics.service';

type BarChartData = {
  label: string;
  value: number;
  color: string;
  darkColor: string;
};

type PieSlice = {
  path: string;
  color: string;
  darkColor: string;
  label: string;
  value: number;
};

type HistogramBar = {
  interval: number;
  buyVolume: number;
  sellVolume: number;
  totalVolume: number;
  buyHeight: number;
  sellHeight: number;
  buyY: number;
  sellY: number;
};

@Component({
  standalone: true,
  imports: [CommonModule, Navbar, NgFor, NgIf, CurrencyPipe],
  selector: 'app-analytics-dashboard',
  styleUrl: './analytics-dashboard.scss',
  templateUrl: './analytics-dashboard.html',
})
export class AnalyticsDashboard implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  analyticsResult = signal<AnalyticsResponse | null>(null);
  objectKeys = Object.keys;
  isBarChart = signal(true);
  loading = signal(false);

  readonly buySellData: BarChartData[] = [
    { label: 'Buy Orders', value: 0, color: '#3B82F6', darkColor: '#1E40AF' },
    { label: 'Sell Orders', value: 0, color: '#EF4444', darkColor: '#991B1B' },
  ];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.performAnalytics();
  }

  performAnalytics() {
    this.loading.set(true);
    this.analyticsService.performAnalytics().subscribe({
      next: (response) => {
        console.log('response received:', response);
        this.analyticsResult.set(response);
        this.buySellData[0].value = response.buy_count;
        this.buySellData[1].value = response.sell_count;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  toggleChartType() {
    this.isBarChart.set(!this.isBarChart());
  }

  get barChartBars(): Array<{ label: string; x: number; y: number; height: number; width: number; color: string; darkColor: string }> {
    const maxValue = Math.max(...this.buySellData.map(d => d.value)) || 1;
    const barWidth = 35;
    const spacing = 15;
    const chartWidth = this.buySellData.length * barWidth + (this.buySellData.length - 1) * spacing;
    const startX = (100 - chartWidth) / 2;

    return this.buySellData.map((data, index) => {
      const normalizedHeight = (data.value / maxValue) * 80;
      const x = startX + index * (barWidth + spacing);
      const y = 100 - normalizedHeight;

      return {
        label: data.label,
        x,
        y,
        height: normalizedHeight,
        width: barWidth,
        color: data.color,
        darkColor: data.darkColor,
      };
    });
  }

  get pieSlices(): PieSlice[] {
    const total = this.buySellData.reduce((sum, d) => sum + d.value, 0) || 1;
    const centerX = 50;
    const centerY = 50;
    const radius = 30;

    let startAngle = -Math.PI / 2;
    const slices: PieSlice[] = [];

    this.buySellData.forEach((data) => {
      const sliceAngle = (data.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1.toFixed(2)} ${y1.toFixed(2)}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
        'Z',
      ].join(' ');

      slices.push({
        path: pathData,
        color: data.color,
        darkColor: data.darkColor,
        label: data.label,
        value: data.value,
      });

      startAngle = endAngle;
    });

    return slices;
  }

  get chartMax(): number {
    return Math.max(...this.buySellData.map(d => d.value)) || 1;
  }

  get chartYAxisValues(): number[] {
    const maxValue = this.chartMax;
    const values = [0, maxValue / 4, maxValue / 2, (maxValue * 3) / 4, maxValue];
    return values.reverse();
  }

  get chartTitle(): string {
    return 'Buy/Sell Order Count';
  }

  get volumeHistogramData(): HistogramBar[] {
    const analyticsData = this.analyticsResult();
    if (!analyticsData) {
      return [];
    }

    const volumeByInterval = analyticsData.volume_by_market_interval_and_side;
    const buyData = volumeByInterval['BUY'] || {};
    const sellData = volumeByInterval['SELL'] || {};

    // Get all unique intervals
    const allIntervals = new Set<number>();
    Object.keys(buyData).forEach(key => allIntervals.add(Number(key)));
    Object.keys(sellData).forEach(key => allIntervals.add(Number(key)));

    const sortedIntervals = Array.from(allIntervals).sort((a, b) => a - b);

    // Calculate max volume for scaling
    let maxVolume = 0;
    sortedIntervals.forEach(interval => {
      const buy = Number(buyData[interval.toString()] || 0);
      const sell = Number(sellData[interval.toString()] || 0);
      maxVolume = Math.max(maxVolume, buy + sell);
    });

    // Create bars with calculated heights
    const barHeight = 80; // SVG coordinate space height for bars
    const bars: HistogramBar[] = sortedIntervals.map(interval => {
      const buy = Number(buyData[interval.toString()] || 0);
      const sell = Number(sellData[interval.toString()] || 0);
      const total = buy + sell;

      const buyHeight = maxVolume > 0 ? (buy / maxVolume) * barHeight : 0;
      const sellHeight = maxVolume > 0 ? (sell / maxVolume) * barHeight : 0;
      const buyY = 100 - sellHeight - buyHeight;
      const sellY = 100 - sellHeight;

      return {
        interval,
        buyVolume: buy,
        sellVolume: sell,
        totalVolume: total,
        buyHeight,
        sellHeight,
        buyY,
        sellY,
      };
    });

    return bars;
  }

  get histogramMaxVolume(): number {
    const bars = this.volumeHistogramData;
    if (bars.length === 0) return 1;
    return Math.max(...bars.map(b => b.totalVolume));
  }

  get histogramYAxisValues(): number[] {
    const maxVolume = this.histogramMaxVolume;
    const values = [0, maxVolume / 4, maxVolume / 2, (maxVolume * 3) / 4, maxVolume];
    return values.reverse();
  }

  private getMarketIntervalTime(interval: number): string {
    // Market hours: 9:30 AM to 4:00 PM (13 intervals of 30 minutes)
    const startHour = 9;
    const startMinute = 30;

    const totalMinutes = startHour * 60 + startMinute + (interval - 1) * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  getIntervalTimeLabel(interval: number): string {
    return this.getMarketIntervalTime(interval);
  }

}
