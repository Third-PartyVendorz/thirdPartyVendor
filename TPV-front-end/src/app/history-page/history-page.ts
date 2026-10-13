import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type OrderHistoryEntry = {
  date: string;
  time: string;
  ticker: string;
  side: 'Buy' | 'Sell';
  quantity: number;
  price: number;
  total: number;
  status: 'Filled' | 'Partially Filled' | 'Cancelled';
  venue: string;
};

type TrendPoint = {
  label: string;
  value: number;
};

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-page.html',
  styleUrl: './history-page.scss',
})
export class HistoryPage {
  readonly trendPoints: TrendPoint[] = [
    { label: 'Jan', value: 18420 },
    { label: 'Feb', value: 19180 },
    { label: 'Mar', value: 18840 },
    { label: 'Apr', value: 19760 },
    { label: 'May', value: 20490 },
    { label: 'Jun', value: 21310 },
    { label: 'Jul', value: 21980 },
    { label: 'Aug', value: 22850 },
    { label: 'Sep', value: 23340 },
    { label: 'Oct', value: 24120 },
  ];

  readonly chartWidth = 640;
  readonly chartHeight = 280;
  readonly chartPadding = 24;

  readonly summaryCards = [
    { label: 'Orders placed', value: '128', detail: '+12 this month' },
    { label: 'Filled today', value: '18', detail: '94% fill rate' },
    { label: 'Pending review', value: '3', detail: 'Waiting on market' },
    { label: 'Net traded', value: '$42.8K', detail: '30 day rolling total' },
  ];

  readonly quickFilters = ['All orders', 'Filled', 'Pending', 'Cancelled'];

  readonly historyEntries: OrderHistoryEntry[] = [
    {
      date: 'Oct 12, 2026',
      time: '09:42 AM',
      ticker: 'AAPL',
      side: 'Buy',
      quantity: 12,
      price: 231.18,
      total: 2774.16,
      status: 'Filled',
      venue: 'NASDAQ',
    },
    {
      date: 'Oct 11, 2026',
      time: '02:17 PM',
      ticker: 'MSFT',
      side: 'Sell',
      quantity: 5,
      price: 415.7,
      total: 2078.5,
      status: 'Partially Filled',
      venue: 'NASDAQ',
    },
    {
      date: 'Oct 10, 2026',
      time: '11:04 AM',
      ticker: 'TSLA',
      side: 'Buy',
      quantity: 3,
      price: 257.41,
      total: 772.23,
      status: 'Filled',
      venue: 'NASDAQ',
    },
    {
      date: 'Oct 08, 2026',
      time: '03:29 PM',
      ticker: 'NVDA',
      side: 'Buy',
      quantity: 8,
      price: 122.94,
      total: 983.52,
      status: 'Cancelled',
      venue: 'NASDAQ',
    },
  ];

  readonly activityFeed = [
    {
      title: 'Order filled',
      description: 'AAPL buy order completed at market price.',
      timestamp: '2 minutes ago',
    },
    {
      title: 'Order updated',
      description: 'MSFT sell order moved from partial to filled.',
      timestamp: '18 minutes ago',
    },
    {
      title: 'Order cancelled',
      description: 'NVDA buy order was cancelled before execution.',
      timestamp: 'Yesterday',
    },
  ];

  getStatusClass(status: OrderHistoryEntry['status']): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  get currentTrendValue(): number {
    return this.trendPoints[this.trendPoints.length - 1]?.value ?? 0;
  }

  get startingTrendValue(): number {
    return this.trendPoints[0]?.value ?? 0;
  }

  get trendChange(): number {
    return this.currentTrendValue - this.startingTrendValue;
  }

  get trendChangePercent(): number {
    if (this.startingTrendValue === 0) {
      return 0;
    }

    return (this.trendChange / this.startingTrendValue) * 100;
  }

  get trendIsPositive(): boolean {
    return this.trendChange >= 0;
  }

  get trendLinePoints(): string {
    return this.buildTrendPoints(false);
  }

  get trendAreaPoints(): string {
    return this.buildTrendPoints(true);
  }

  get trendYAxisLabels(): number[] {
    const values = this.trendPoints.map((point) => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const steps = 4;
    const interval = (maxValue - minValue) / steps || 1;

    return Array.from({ length: steps + 1 }, (_value, index) => {
      return Math.round((maxValue - interval * index) / 10) * 10;
    });
  }

  private buildTrendPoints(closePath: boolean): string {
    const values = this.trendPoints.map((point) => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const horizontalStep = this.trendPoints.length > 1
      ? (this.chartWidth - this.chartPadding * 2) / (this.trendPoints.length - 1)
      : 0;
    const valueRange = maxValue - minValue || 1;

    const points = this.trendPoints.map((point, index) => {
      const x = this.chartPadding + horizontalStep * index;
      const normalized = (point.value - minValue) / valueRange;
      const y = this.chartHeight - this.chartPadding - normalized * (this.chartHeight - this.chartPadding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    if (!closePath) {
      return points.join(' ');
    }

    const baselineY = this.chartHeight - this.chartPadding;
    return [
      `${this.chartPadding},${baselineY}`,
      ...points,
      `${this.chartWidth - this.chartPadding},${baselineY}`,
    ].join(' ');
  }
}
