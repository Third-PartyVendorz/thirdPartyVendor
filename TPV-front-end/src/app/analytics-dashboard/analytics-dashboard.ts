import { CurrencyPipe, NgFor, NgIf, CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';

import { Navbar } from './../navbar/navbar';
import { AnalyticsResponse } from '../dto/AnalyticsResponse';
import { AnalyticsService } from '../services/analytics.service';

type ChartBar = {
  label: string;
  value: number;
  color: string;
  x?: number;
  y?: number;
  height?: number;
  width?: number;
};

type PieSlice = {
  path: string;
  color: string;
  label: string;
  value: number;
};

type IntervalData = {
  time: string;
  buy: number;
  sell: number;
};

@Component({
  standalone: true,
  imports: [CommonModule, Navbar, NgFor, NgIf, CurrencyPipe],
  selector: 'app-analytics-dashboard',
  styleUrl: './analytics-dashboard.scss',
  templateUrl: './analytics-dashboard.html',
})
export class AnalyticsDashboard implements OnInit {
  analyticsResult = signal<AnalyticsResponse | null>(null);
  loading = signal(false);

  // Toggle states for sections
  orderDistributionMode = signal<'count' | 'volume'>('count');
  volumeByMarketMode = signal<'volume' | 'slide'>('volume');
  volumeByDateMode = signal<'volume' | 'slide'>('volume');

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.performAnalytics();
  }

  performAnalytics() {
    this.loading.set(true);
    this.analyticsService.performAnalytics().subscribe({
      next: (response) => {
        this.analyticsResult.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Analytics error:', err);
        this.loading.set(false);
      }
    });
  }

  // Summary Cards
  get summaryCards() {
    const data = this.analyticsResult();
    if (!data) return [];
    return [
      { label: 'Buy Orders', value: data.buy_count, color: '#10B981' },
      { label: 'Sell Orders', value: data.sell_count, color: '#EF4444' },
      { label: 'Buy Volume', value: data.buy_volume, color: '#3B82F6' },
      { label: 'Sell Volume', value: data.sell_volume, color: '#8B5CF6' },
    ];
  }

  // Toggle Order Distribution mode
  toggleOrderDistributionMode() {
    this.orderDistributionMode.set(
      this.orderDistributionMode() === 'count' ? 'volume' : 'count'
    );
  }

  toggleVolumeByMarketMode() {
    this.volumeByMarketMode.set(
      this.volumeByMarketMode() === 'volume' ? 'slide' : 'volume'
    );
  }

  toggleVolumeByDateMode() {
    this.volumeByDateMode.set(
      this.volumeByDateMode() === 'volume' ? 'slide' : 'volume'
    );
  }

  // Buy vs Sell Chart (supports both count and volume modes)
  get buySellChart(): ChartBar[] {
    const data = this.analyticsResult();
    if (!data) return [];
    
    const mode = this.orderDistributionMode();
    const bars = [
      { 
        label: 'Buy', 
        value: mode === 'count' ? data.buy_count : data.buy_volume, 
        color: '#10B981' 
      },
      { 
        label: 'Sell', 
        value: mode === 'count' ? data.sell_count : data.sell_volume, 
        color: '#EF4444' 
      },
    ];
    
    const maxValue = Math.max(...bars.map(b => b.value)) || 1;
    const barWidth = 25;
    const gap = 30;
    const startX = 25;
    
    return bars.map((bar, idx) => ({
      ...bar,
      x: startX + idx * (barWidth + gap),
      y: 20 + ((1 - bar.value / maxValue) * 70),
      height: (bar.value / maxValue) * 70,
      width: barWidth,
    }));
  }

  get buySellMaxValue(): number {
    const data = this.analyticsResult();
    if (!data) return 1;
    const mode = this.orderDistributionMode();
    if (mode === 'count') {
      return Math.max(data.buy_count, data.sell_count) || 1;
    } else {
      return Math.max(data.buy_volume, data.sell_volume) || 1;
    }
  }

  get buySellAxisValues(): number[] {
    const max = this.buySellMaxValue;
    return [max, (max * 3) / 4, (max / 2), (max / 4), 0];
  }

  // Buy vs Sell Pie Chart
  get buySellPie(): PieSlice[] {
    const data = this.analyticsResult();
    if (!data) return [];

    const mode = this.orderDistributionMode();
    const buyValue = mode === 'count' ? data.buy_count : data.buy_volume;
    const sellValue = mode === 'count' ? data.sell_count : data.sell_volume;
    const total = buyValue + sellValue || 1;

    const centerX = 50, centerY = 50, radius = 28;
    
    // Buy slice
    const buyRatio = buyValue / total;
    const buyAngle = buyRatio * 2 * Math.PI;
    const buyX1 = centerX + radius;
    const buyY1 = centerY;
    const buyX2 = centerX + radius * Math.cos(buyAngle);
    const buyY2 = centerY + radius * Math.sin(buyAngle);
    const buyLargeArc = buyAngle > Math.PI ? 1 : 0;
    
    // Sell slice
    const sellAngle = Math.PI * 2 - buyAngle;
    const sellX1 = buyX2;
    const sellY1 = buyY2;
    const sellX2 = centerX + radius;
    const sellY2 = centerY;
    const sellLargeArc = sellAngle > Math.PI ? 1 : 0;

    return [
      {
        path: `M ${centerX} ${centerY} L ${buyX1} ${buyY1} A ${radius} ${radius} 0 ${buyLargeArc} 1 ${buyX2.toFixed(2)} ${buyY2.toFixed(2)} Z`,
        color: '#10B981',
        label: 'Buy',
        value: buyValue,
      },
      {
        path: `M ${centerX} ${centerY} L ${sellX1.toFixed(2)} ${sellY1.toFixed(2)} A ${radius} ${radius} 0 ${sellLargeArc} 1 ${sellX2} ${sellY2} Z`,
        color: '#EF4444',
        label: 'Sell',
        value: sellValue,
      },
    ];
  }

  // Volume by Date Chart (horizontal bar format)
  get volumeByDateList(): Array<{ date: string; value: number; percentage: number }> {
    const data = this.analyticsResult();
    if (!data || !data.trade_volume_by_date) return [];
    
    const entries = Object.entries(data.trade_volume_by_date);
    const maxValue = Math.max(...entries.map(([_, vol]) => Number(vol))) || 1;
    
    return entries.map(([date, vol]) => ({
      date,
      value: Number(vol),
      percentage: (Number(vol) / maxValue) * 100,
    }));
  }

  get volumeByDateMaxValue(): number {
    const data = this.analyticsResult();
    if (!data || !data.trade_volume_by_date) return 1;
    const values = Object.values(data.trade_volume_by_date).map(v => Number(v));
    return Math.max(...values) || 1;
  }

  // Top K Most Traded Assets (list format)
  get topAssetsList(): Array<{ rank: number; symbol: string; value: number }> {
    const data = this.analyticsResult();
    if (!data || !data.top_5_most_traded_assets) return [];
    
    return Object.entries(data.top_5_most_traded_assets)
      .map(([symbol, value], idx) => ({
        rank: idx + 1,
        symbol,
        value: Number(value),
      }))
      .sort((a, b) => b.value - a.value);
  }

  // Market Hours Volume Chart
  get marketHoursChart(): Array<any> {
    const data = this.analyticsResult();
    if (!data || !data.volume_by_market_interval_and_side) return [];
    
    const buyData = data.volume_by_market_interval_and_side['BUY'] || {};
    const sellData = data.volume_by_market_interval_and_side['SELL'] || {};
    
    const intervals = new Set<number>();
    Object.keys(buyData).forEach(k => intervals.add(Number(k)));
    Object.keys(sellData).forEach(k => intervals.add(Number(k)));
    
    const sorted = Array.from(intervals).sort((a, b) => a - b);
    const maxVolume = Math.max(...sorted.map(i => {
      const b = Number(buyData[i.toString()] || 0);
      const s = Number(sellData[i.toString()] || 0);
      return b + s;
    })) || 1;
    
    const slotWidth = 100 / sorted.length;
    const barWidth = slotWidth * 0.65;
    
    return sorted.map((interval, idx) => {
      const buy = Number(buyData[interval.toString()] || 0);
      const sell = Number(sellData[interval.toString()] || 0);
      const total = buy + sell;
      const totalHeight = (total / maxVolume) * 70;
      const buyHeight = (buy / maxVolume) * 70;
      
      return {
        time: this.getMarketTime(interval),
        x: (idx * slotWidth) + (slotWidth - barWidth) / 2,
        barWidth,
        sellY: 20 + ((total - sell) / maxVolume) * 70,
        buyY: 20 + ((total - buy) / maxVolume) * 70,
        sellHeight: (sell / maxVolume) * 70,
        buyHeight,
        buy,
        sell,
      };
    });
  }

  get marketHoursMaxVolume(): number {
    const data = this.analyticsResult();
    if (!data || !data.volume_by_market_interval_and_side) return 1;
    
    const buyData = data.volume_by_market_interval_and_side['BUY'] || {};
    const sellData = data.volume_by_market_interval_and_side['SELL'] || {};
    
    const intervals = new Set<number>();
    Object.keys(buyData).forEach(k => intervals.add(Number(k)));
    Object.keys(sellData).forEach(k => intervals.add(Number(k)));
    
    return Math.max(...Array.from(intervals).map(i => {
      const b = Number(buyData[i.toString()] || 0);
      const s = Number(sellData[i.toString()] || 0);
      return b + s;
    })) || 1;
  }

  get marketHoursAxisValues(): number[] {
    const max = this.marketHoursMaxVolume;
    return [max, (max * 3) / 4, (max / 2), (max / 4), 0];
  }

  private getMarketTime(interval: number): string {
    const startHour = 9, startMinute = 30;
    const totalMinutes = startHour * 60 + startMinute + (interval - 1) * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')}`;
  }
}
