import { DecimalPipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';

import { Navbar } from './../navbar/navbar';
import { AnalyticsResponse } from '../dto/AnalyticsResponse';
import { AnalyticsService } from '../services/analytics.service';

const BUY_COLOR = '#10B981';
const SELL_COLOR = '#EF4444';
const TOTAL_COLOR = '#F59E0B';
const AXIS_STEPS = 4;

type AxisTick = { label: string; pct: number };

// One piece of a (possibly stacked) bar. `pct` is its share of the whole bar.
type BarSegment = { name: string; value: number; color: string; pct: number };

type BarColumn = {
  label: string;
  total: number;
  heightPct: number; // share of the axis max
  segments: BarSegment[];
};

type BarChartModel = { ticks: AxisTick[]; columns: BarColumn[] };

type PieSlice = {
  path: string;
  color: string;
  label: string;
  value: number;
};

type LegendItem = { label: string; color: string };

type DateRow = {
  date: string;
  total: number;
  widthPct: number; // share of the largest date
  segments: BarSegment[];
};

type MarketRow = { interval: number; buy: number; sell: number };

const EMPTY_CHART: BarChartModel = { ticks: [], columns: [] };

@Component({
  standalone: true,
  imports: [Navbar, NgFor, NgIf, NgTemplateOutlet, DecimalPipe],
  selector: 'app-analytics-dashboard',
  styleUrl: './analytics-dashboard.scss',
  templateUrl: './analytics-dashboard.html',
})
export class AnalyticsDashboard implements OnInit {
  analyticsResult = signal<AnalyticsResponse | null>(null);
  loading = signal(false);

  // Toggle states for sections
  orderDistributionMode = signal<'count' | 'volume'>('count');
  volumeByMarketMode = signal<'volume' | 'side'>('side');
  volumeByDateMode = signal<'volume' | 'side'>('volume');

  readonly sideLegend: LegendItem[] = [
    { label: 'Buy', color: BUY_COLOR },
    { label: 'Sell', color: SELL_COLOR },
  ];
  readonly totalLegend: LegendItem[] = [{ label: 'Total volume', color: TOTAL_COLOR }];

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
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Summary cards (template section is currently commented out)
  // ---------------------------------------------------------------------------
  readonly summaryCards = computed(() => {
    const data = this.analyticsResult();
    if (!data) return [];
    return [
      // { label: 'Buy Orders', value: data.buy_count, color: BUY_COLOR },
      // { label: 'Sell Orders', value: data.sell_count, color: SELL_COLOR },
      // { label: 'Buy Volume', value: data.buy_volume, color: '#3B82F6' },
      // { label: 'Sell Volume', value: data.sell_volume, color: '#8B5CF6' },
      { label: 'Total Orders', value: (data.buy_count || 0) + (data.sell_count || 0), color: TOTAL_COLOR },
      { label: 'Total Volume', value: (data.buy_volume || 0) + (data.sell_volume || 0), color: TOTAL_COLOR },
    ];
  });

  // ---------------------------------------------------------------------------
  // Order distribution: bar + pie (count / volume)
  // ---------------------------------------------------------------------------
  private readonly buySellValues = computed(() => {
    const data = this.analyticsResult();
    if (!data) return null;
    const isCount = this.orderDistributionMode() === 'count';
    return {
      isCount,
      buy: Number(isCount ? data.buy_count : data.buy_volume) || 0,
      sell: Number(isCount ? data.sell_count : data.sell_volume) || 0,
    };
  });

  readonly buySellChart = computed<BarChartModel>(() => {
    const v = this.buySellValues();
    if (!v) return EMPTY_CHART;

    const axis = this.buildAxis(Math.max(v.buy, v.sell), v.isCount);
    return {
      ticks: axis.ticks,
      columns: [
        this.makeColumn('Buy', [{ name: 'Buy', value: v.buy, color: BUY_COLOR }], axis.max),
        this.makeColumn('Sell', [{ name: 'Sell', value: v.sell, color: SELL_COLOR }], axis.max),
      ],
    };
  });

  readonly buySellPie = computed<PieSlice[]>(() => {
    const v = this.buySellValues();
    if (!v) return [];

    const total = v.buy + v.sell;
    const buyAngle = total > 0 ? (v.buy / total) * 2 * Math.PI : 0;
    const start = -Math.PI / 2; // start at 12 o'clock

    return [
      {
        path: this.slicePath(start, start + buyAngle),
        color: BUY_COLOR,
        label: 'Buy',
        value: v.buy,
      },
      {
        path: this.slicePath(start + buyAngle, start + (total > 0 ? 2 * Math.PI : 0)),
        color: SELL_COLOR,
        label: 'Sell',
        value: v.sell,
      },
    ];
  });

  // ---------------------------------------------------------------------------
  // Order volume by 30 minute market interval (volume / side)
  // ---------------------------------------------------------------------------
  readonly marketHoursChart = computed<BarChartModel>(() => {
    const data = this.analyticsResult();
    const sides = data?.volume_by_market_interval_and_side;
    if (!sides) return EMPTY_CHART;

    const buyData = sides['BUY'] ?? {};
    const sellData = sides['SELL'] ?? {};

    const keys = [...Object.keys(buyData), ...Object.keys(sellData)]
      .map(Number)
      .filter((n) => Number.isFinite(n));
    if (!keys.length) return EMPTY_CHART;

    // Include empty intervals between the first and last so the time axis has no gaps
    const first = Math.min(...keys);
    const last = Math.max(...keys);
    const rows: MarketRow[] = [];
    for (let interval = first; interval <= last; interval++) {
      rows.push({
        interval,
        buy: Number(buyData[String(interval)] ?? 0) || 0,
        sell: Number(sellData[String(interval)] ?? 0) || 0,
      });
    }

    // Axis is always based on the stacked total so it doesn't move when toggling
    const axis = this.buildAxis(Math.max(...rows.map((r) => r.buy + r.sell)), false);
    const isSide = this.volumeByMarketMode() === 'side';

    return {
      ticks: axis.ticks,
      columns: rows.map((r) =>
        this.makeColumn(
          this.getMarketTime(r.interval),
          isSide
            ? [
                { name: 'Buy', value: r.buy, color: BUY_COLOR },
                { name: 'Sell', value: r.sell, color: SELL_COLOR },
              ]
            : [{ name: 'Total', value: r.buy + r.sell, color: TOTAL_COLOR }],
          axis.max,
        ),
      ),
    };
  });

  readonly marketLegend = computed(() =>
    this.volumeByMarketMode() === 'side' ? this.sideLegend : this.totalLegend,
  );

  // ---------------------------------------------------------------------------
  // Order volume by date (volume / side)
  // ---------------------------------------------------------------------------
  readonly volumeByDateRows = computed<DateRow[]>(() => {
    const data = this.analyticsResult();
    if (!data || !data.trade_volume_by_date) return [];

    const buyData = data.trade_volume_by_date_and_side?.['BUY'] ?? {};
    const sellData = data.trade_volume_by_date_and_side?.['SELL'] ?? {};
    const isSide = this.volumeByDateMode() === 'side';

    const entries = Object.entries(data.trade_volume_by_date).map(([date, vol]) => ({
      date,
      total: Number(vol) || 0,
      buy: Number(buyData[date] ?? 0) || 0,
      sell: Number(sellData[date] ?? 0) || 0,
    }));

    // Scale is always based on the total so bars keep their length when toggling
    const maxValue = Math.max(1, ...entries.map((e) => e.total));

    return entries.map((e) => ({
      date: e.date,
      total: e.total,
      widthPct: (e.total / maxValue) * 100,
      segments: this.toSegments(
        isSide
          ? [
              { name: 'Buy', value: e.buy, color: BUY_COLOR },
              { name: 'Sell', value: e.sell, color: SELL_COLOR },
            ]
          : [{ name: 'Total', value: e.total, color: TOTAL_COLOR }],
      ),
    }));
  });

  readonly volumeByDateLegend = computed(() =>
    this.volumeByDateMode() === 'side' ? this.sideLegend : this.totalLegend,
  );

  // ---------------------------------------------------------------------------
  // Top K most traded assets
  // ---------------------------------------------------------------------------
  readonly topAssetsList = computed<Array<{ rank: number; symbol: string; value: number }>>(() => {
    const data = this.analyticsResult();
    if (!data || !data.top_5_most_traded_assets) return [];

    return Object.entries(data.top_5_most_traded_assets)
      .map(([symbol, value]) => ({ symbol, value: Number(value) }))
      .sort((a, b) => b.value - a.value)
      .map(({ symbol, value }, idx) => ({ rank: idx + 1, symbol, value }));
  });

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Builds a "nice" y-axis (round step values) with AXIS_STEPS + 1 evenly spaced ticks. */
  private buildAxis(maxValue: number, integerOnly: boolean): { max: number; ticks: AxisTick[] } {
    const rawStep = (maxValue > 0 ? maxValue : 1) / AXIS_STEPS;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;
    const niceFactor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;

    let step = niceFactor * magnitude;
    if (integerOnly) step = Math.max(1, Math.ceil(step));

    const ticks: AxisTick[] = [];
    for (let i = 0; i <= AXIS_STEPS; i++) {
      ticks.push({ label: this.formatAxisValue(step * i), pct: (i / AXIS_STEPS) * 100 });
    }
    return { max: step * AXIS_STEPS, ticks };
  }

  private formatAxisValue(value: number): string {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
    }).format(value);
  }

  private makeColumn(
    label: string,
    parts: Array<{ name: string; value: number; color: string }>,
    axisMax: number,
  ): BarColumn {
    const segments = this.toSegments(parts);
    const total = parts.reduce((sum, p) => sum + p.value, 0);
    return { label, total, heightPct: axisMax > 0 ? (total / axisMax) * 100 : 0, segments };
  }

  private toSegments(parts: Array<{ name: string; value: number; color: string }>): BarSegment[] {
    const total = parts.reduce((sum, p) => sum + p.value, 0);
    return parts.map((p) => ({ ...p, pct: total > 0 ? (p.value / total) * 100 : 0 }));
  }

  /** SVG path for a pie slice between two angles (radians, clockwise). */
  private slicePath(startAngle: number, endAngle: number): string {
    const cx = 50;
    const cy = 50;
    const r = 48;
    const sweep = endAngle - startAngle;

    if (sweep <= 0) return '';

    // A single slice covering 100% can't be drawn as one arc, so draw a full circle
    if (sweep >= 2 * Math.PI - 1e-6) {
      return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
    }

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;

    return `M ${cx} ${cy} L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;
  }

  /** Interval 1 starts at 9:30 AM; each interval is 30 minutes. */
  private getMarketTime(interval: number): string {
    const startHour = 9;
    const startMinute = 30;
    const totalMinutes = startHour * 60 + startMinute + (interval - 1) * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')}${ampm}`;
  }
}
