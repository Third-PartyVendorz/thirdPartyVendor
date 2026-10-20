import { DecimalPipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Navbar } from './../navbar/navbar';
import { AnalystNavbar } from './../analyst/analyst-navbar/analyst-navbar';
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
  percentage: number;
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
  imports: [AnalystNavbar, NgFor, NgIf, NgTemplateOutlet, DecimalPipe, FormsModule],
  selector: 'app-analytics-dashboard',
  styleUrl: './analytics-dashboard.scss',
  templateUrl: './analytics-dashboard.html',
})
export class AnalyticsDashboard implements OnInit {
  analyticsResult = signal<AnalyticsResponse | null>(null);
  customAnalyticsResult = signal<AnalyticsResponse | null>(null);
  loading = signal(false);

  // Toggle states for sections
  orderDistributionMode = signal<'count' | 'volume'>('count');
  volumeByMarketMode = signal<'volume' | 'side'>('side');
  volumeByDateMode = signal<'volume' | 'side'>('volume');
  topAssetsMode = signal<'total' | 'buy' | 'sell'>('total');
  timelineMode = signal<'monthly' | 'custom'>('monthly');

  // Custom date range form
  customStartDate = signal<string>('');
  customEndDate = signal<string>('');

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
  // Custom date form validation
  // ---------------------------------------------------------------------------
  readonly isCustomDateFormValid = computed(() => {
    const startDate = this.customStartDate();
    const endDate = this.customEndDate();
    
    // Both dates must be provided
    if (!startDate || !endDate) return false;
    
    // End date must be greater than or equal to start date
    return endDate >= startDate;
  });

  onCustomDateSubmit(): void {
    if (!this.isCustomDateFormValid()) {
      console.error('Invalid date range: end date cannot be before start date');
      return;
    }

    console.log('Custom date range submitted:', {
      startDate: this.customStartDate(),
      endDate: this.customEndDate(),
    });
    this.analyticsService.performAnalytics({
      startDate: this.customStartDate(),
      endDate: this.customEndDate(),
    }).subscribe({
      next: (response) => {
        this.customAnalyticsResult.set(response);
        console.log('Custom date range analytics response:', response);
      },
      error: (err) => {
        console.error('Analytics error:', err);
      },
    });
  }

  downloadCustomReport(): void {
    const data = this.customAnalyticsResult();
    if (!data) return;

    const startDate = this.customStartDate();
    const endDate = this.customEndDate();
    const totalTrades = (Number(data.buy_count) || 0) + (Number(data.sell_count) || 0);
    const totalVolume = (Number(data.buy_volume) || 0) + (Number(data.sell_volume) || 0);
    const formatNumber = (value: unknown) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 }).format(Number(value) || 0);
    const summaryCards = [
      ['Total Trades', totalTrades],
      ['Total Volume', totalVolume],
    ].map(([label, value]) => `<div class="summary-card"><div class="card-icon"></div><div><div class="card-label">${label}</div><div class="card-value">${formatNumber(value)}</div></div></div>`).join('');
    const renderOrder = (isCount: boolean) => {
      const buy = Number(isCount ? data.buy_count : data.buy_volume) || 0;
      const sell = Number(isCount ? data.sell_count : data.sell_volume) || 0;
      const axis = this.buildAxis(Math.max(buy, sell), isCount);
      const chart: BarChartModel = { ticks: axis.ticks, columns: [this.makeColumn('Buy', [{ name: 'Buy', value: buy, color: BUY_COLOR }], axis.max), this.makeColumn('Sell', [{ name: 'Sell', value: sell, color: SELL_COLOR }], axis.max)] };
      const total = buy + sell;
      const slices: PieSlice[] = [
        { path: this.slicePath(-Math.PI / 2, -Math.PI / 2 + (total ? buy / total * 2 * Math.PI : 0)), color: BUY_COLOR, label: 'Buy', value: buy, percentage: total ? buy / total * 100 : 0 },
        { path: this.slicePath(-Math.PI / 2 + (total ? buy / total * 2 * Math.PI : 0), -Math.PI / 2 + (total ? 2 * Math.PI : 0)), color: SELL_COLOR, label: 'Sell', value: sell, percentage: total ? sell / total * 100 : 0 },
      ];
      return `<div class="distribution-content"><div>${this.renderExportBarChart(chart)}</div><div class="pie-layout">${this.renderExportPieChart(slices)}<div class="pie-legend">${this.renderExportLegend([{ label: 'Buy', color: BUY_COLOR }, { label: 'Sell', color: SELL_COLOR }])}</div></div></div>`;
    };
    const renderMarket = (isSide: boolean) => {
      const buyData = data.volume_by_market_interval_and_side?.BUY ?? {};
      const sellData = data.volume_by_market_interval_and_side?.SELL ?? {};
      const keys = [...Object.keys(buyData), ...Object.keys(sellData)].map(Number).filter((value) => Number.isFinite(value) && value >= 1 && value <= 13);
      const rows = keys.length ? Array.from({ length: Math.max(...keys) - Math.min(...keys) + 1 }, (_, index) => Math.min(...keys) + index).map((interval) => ({ interval, buy: Number(buyData[String(interval)] ?? 0) || 0, sell: Number(sellData[String(interval)] ?? 0) || 0 })) : [];
      const axis = this.buildAxis(Math.max(0, ...rows.map((row) => row.buy + row.sell)), false);
      const chart: BarChartModel = { ticks: axis.ticks, columns: rows.map((row) => this.makeColumn(this.getMarketTime(row.interval), isSide ? [{ name: 'Buy', value: row.buy, color: BUY_COLOR }, { name: 'Sell', value: row.sell, color: SELL_COLOR }] : [{ name: 'Total', value: row.buy + row.sell, color: TOTAL_COLOR }], axis.max)) };
      return `${this.renderExportBarChart(chart)}${this.renderExportLegend(isSide ? this.sideLegend : this.totalLegend)}`;
    };
    const renderDates = (isSide: boolean) => {
      const buyData = data.trade_volume_by_date_and_side?.BUY ?? {};
      const sellData = data.trade_volume_by_date_and_side?.SELL ?? {};
      const entries = Object.entries(data.trade_volume_by_date ?? {}).map(([date, volume]) => ({ date, total: Number(volume) || 0, buy: Number(buyData[date] ?? 0) || 0, sell: Number(sellData[date] ?? 0) || 0 }));
      const maxValue = Math.max(1, ...entries.map((entry) => entry.total));
      const dateRows = entries.map((entry) => { const segments = this.toSegments(isSide ? [{ name: 'Buy', value: entry.buy, color: BUY_COLOR }, { name: 'Sell', value: entry.sell, color: SELL_COLOR }] : [{ name: 'Total', value: entry.total, color: TOTAL_COLOR }]); return `<div class="date-item"><div class="date-label">${this.escapeHtml(entry.date)}</div><div class="bar-track"><div class="date-bar" style="width:${entry.total / maxValue * 100}%">${segments.map((segment) => `<span style="width:${segment.pct}%;background:${segment.color}" title="${this.escapeHtml(segment.name)}: ${formatNumber(segment.value)}"></span>`).join('')}</div></div><div class="bar-value">${formatNumber(entry.total)} units</div></div>`; }).join('');
      return `<div class="scroll">${dateRows}</div>${this.renderExportLegend(isSide ? this.sideLegend : this.totalLegend)}`;
    };
    const renderAssets = (mode: 'total' | 'buy' | 'sell') => {
      const assets = mode === 'total' ? data.top_5_most_traded_assets : data.top_5_most_traded_assets_by_side?.[mode.toUpperCase() as 'BUY' | 'SELL'] ?? {};
      const sortedAssets = Object.entries(assets).sort(([, leftValue], [, rightValue]) => Number(rightValue) - Number(leftValue));
      return `<div class="scroll">${sortedAssets.map(([symbol, value], index) => `<div class="asset-item"><div class="asset-rank">${index + 1}.</div><div class="asset-name">${this.escapeHtml(symbol)}</div><div class="asset-value">${formatNumber(value)} Shares</div></div>`).join('')}</div>`;
    };

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Analytics Report: ${this.escapeHtml(startDate)} to ${this.escapeHtml(endDate)}</title>
  <style>
    :root { color-scheme: light; font-family: Arial, sans-serif; color: #0f172a; background: #f8fafc; }
    * { box-sizing: border-box; } body { max-width: 1600px; margin: 0 auto; padding: 32px; background: #f8fafc; }
    h1 { font-size: 32px; margin: 0 0 8px; } h2 { font-size: 21px; margin: 0; } h3 { font-size: 18px; margin: 0; }
    .period { color: #64748b; margin-bottom: 28px; } section { margin-top: 24px; }
    .summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
    .summary-card, .chart-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .summary-card { display: flex; align-items: center; gap: 20px; } .card-icon { width: 48px; height: 48px; border-radius: 8px; background: #f59e0b; opacity: .15; }
    .card-label, .legend-item, .date-label, .bar-value, .asset-value { color: #64748b; } .card-label { font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: .05em; }
    .card-value { font-size: 28px; font-weight: 800; margin-top: 7px; } .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .distribution-content { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; } .bar-chart { display: grid; grid-template-columns: 56px minmax(0,1fr); gap: 8px; padding-top: 8px; }
    .y-axis, .plot { height: 250px; position: relative; } .y-tick { position: absolute; right: 0; transform: translateY(50%); font-size: 12px; font-weight: 600; color: #94a3b8; }
    .plot { border-left: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; } .gridline { position: absolute; left: 0; right: 0; height: 1px; background: #f1f5f9; }
    .columns { position: absolute; inset: 0; display: flex; } .column { flex: 1; display: flex; align-items: flex-end; justify-content: center; }
    .bar-stack { width: 60%; max-width: 96px; display: flex; flex-direction: column; overflow: hidden; border-radius: 4px 4px 0 0; } .bar-segment { width: 100%; }
    .plot-area { min-width: 0; } .x-labels { display: flex; margin-top: 8px; } .x-label { flex: 1; text-align: center; font-size: 12px; font-weight: 600; color: #475569; }
    .x-label.rotated { height: 72px; writing-mode: vertical-rl; transform: rotate(180deg); text-align: left; }
    .chart-legend { display: flex; gap: 24px; margin-top: 16px; } .legend-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
    .legend-box, .legend-dot { width: 15px; height: 15px; border-radius: 3px; display: inline-block; } .pie-layout { display: flex; align-items: center; justify-content: center; gap: 32px; }
    .pie-svg { width: 210px; height: 210px; } .pie-legend { display: grid; gap: 12px; } .date-item { display: grid; grid-template-columns: 100px minmax(0,1fr) 110px; gap: 16px; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
    .date-label { text-align: right; font-weight: 600; } .bar-track { height: 24px; background: #f8fafc; border-radius: 3px; } .date-bar { height: 100%; display: flex; overflow: hidden; border-radius: 3px; }
    .date-bar span { height: 100%; } .bar-value { font-size: 13px; font-weight: 600; white-space: nowrap; } .asset-item { display: grid; grid-template-columns: 40px 1fr 1fr; gap: 16px; padding: 16px; border-bottom: 1px solid #e2e8f0; }
    .asset-rank, .asset-name { font-weight: 700; } .asset-value { text-align: right; font-size: 14px; } .scroll { max-height: 400px; overflow-y: auto; padding-right: 8px; }
    .scroll::-webkit-scrollbar { width: 8px; } .scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; } .scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    .toggle-buttons { display: flex; gap: 8px; background: #f1f5f9; padding: 4px; border-radius: 6px; } .toggle-btn { min-width: 84px; padding: 8px 16px; border: 0; border-radius: 4px; background: transparent; color: #64748b; font-weight: 600; cursor: pointer; } .toggle-btn.active { background: #033d6c; color: white; }
    [data-panel] { display: none; } [data-panel].active { display: block; }
    @media (max-width: 800px) { body { padding: 16px; } .summary, .distribution-content { grid-template-columns: 1fr; } .pie-layout { flex-direction: column; } .date-item { grid-template-columns: 80px minmax(0,1fr) 90px; gap: 8px; } }
  </style>
</head>
<body>
  <h1>Analytics Report</h1>
  <div class="period">Custom period: ${this.escapeHtml(startDate)} to ${this.escapeHtml(endDate)}</div>
  <div class="summary">${summaryCards}</div>
  <section class="chart-card"><div class="card-header"><h3>Trade Distribution by <span data-label="order">Count</span></h3><div class="toggle-buttons" data-toggle="order"><button class="toggle-btn active" data-value="count">Count</button><button class="toggle-btn" data-value="volume">Volume</button></div></div><div data-panel="order-count" class="active">${renderOrder(true)}</div><div data-panel="order-volume">${renderOrder(false)}</div></section>
  <section class="chart-card"><div class="card-header"><h3>Trade Volume by 30 Minute Market Interval</h3><div class="toggle-buttons" data-toggle="market"><button class="toggle-btn active" data-value="side">Side</button><button class="toggle-btn" data-value="volume">Volume</button></div></div><div data-panel="market-side" class="active">${renderMarket(true)}</div><div data-panel="market-volume">${renderMarket(false)}</div></section>
  <section class="chart-card"><div class="card-header"><h3>Trade Volume by Date</h3><div class="toggle-buttons" data-toggle="date"><button class="toggle-btn active" data-value="volume">Volume</button><button class="toggle-btn" data-value="side">Side</button></div></div><div data-panel="date-volume" class="active">${renderDates(false)}</div><div data-panel="date-side">${renderDates(true)}</div></section>
  <section class="chart-card"><div class="card-header"><h3>Top K Most Traded Assets</h3><div class="toggle-buttons" data-toggle="assets"><button class="toggle-btn active" data-value="total">Total</button><button class="toggle-btn" data-value="buy">Buy</button><button class="toggle-btn" data-value="sell">Sell</button></div></div><div data-panel="assets-total" class="active">${renderAssets('total')}</div><div data-panel="assets-buy">${renderAssets('buy')}</div><div data-panel="assets-sell">${renderAssets('sell')}</div></section>
  <script>
    document.querySelectorAll('[data-toggle]').forEach(function (toggle) {
      toggle.querySelectorAll('.toggle-btn').forEach(function (button) {
        button.addEventListener('click', function () {
          var group = toggle.getAttribute('data-toggle');
          var value = button.getAttribute('data-value');
          toggle.querySelectorAll('.toggle-btn').forEach(function (item) { item.classList.toggle('active', item === button); });
          document.querySelectorAll('[data-panel^="' + group + '-"]').forEach(function (panel) { panel.classList.toggle('active', panel.getAttribute('data-panel') === group + '-' + value); });
          var label = document.querySelector('[data-label="' + group + '"]');
          if (label) label.textContent = value === 'count' ? 'Count' : 'Volume';
        });
      });
    });
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${startDate}-to-${endDate}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private renderExportBarChart(chart: BarChartModel): string {
    const gridlines = chart.ticks.map((tick) => `<span class="gridline" style="bottom:${tick.pct}%"></span>`).join('');
    const ticks = chart.ticks.map((tick) => `<span class="y-tick" style="bottom:${tick.pct}%">${this.escapeHtml(tick.label)}</span>`).join('');
    const columns = chart.columns.map((column) => `<div class="column"><div class="bar-stack" style="height:${column.heightPct}%">${column.segments.map((segment) => `<span class="bar-segment" style="height:${segment.pct}%;background:${segment.color}" title="${this.escapeHtml(segment.name)}: ${segment.value}"></span>`).join('')}</div></div>`).join('');
    const labels = chart.columns.map((column) => `<span class="x-label">${this.escapeHtml(column.label)}</span>`).join('');
    return `<div class="bar-chart"><div class="y-axis">${ticks}</div><div class="plot-area"><div class="plot">${gridlines}<div class="columns">${columns}</div></div><div class="x-labels">${labels}</div></div></div>`;
  }

  private renderExportPieChart(slices: PieSlice[]): string {
    const paths = slices.map((slice) => `<path d="${slice.path}" fill="${slice.color}"></path>`).join('');
    return `<svg viewBox="0 0 100 100" class="pie-svg"><circle cx="50" cy="50" r="48" fill="#e2e8f0"></circle>${paths}</svg>`;
  }

  private renderExportLegend(items: LegendItem[]): string {
    return `<div class="chart-legend">${items.map((item) => `<div class="legend-item"><span class="legend-box" style="background:${item.color}"></span>${this.escapeHtml(item.label)}</div>`).join('')}</div>`;
  }

  // ---------------------------------------------------------------------------
  // Active analytics data (returns monthly or custom based on timelineMode)
  // ---------------------------------------------------------------------------
  readonly activeAnalyticsData = computed<AnalyticsResponse | null>(() => {
    return this.timelineMode() === 'custom' ? this.customAnalyticsResult() : this.analyticsResult();
  });

  readonly hasActiveData = computed(() => this.activeAnalyticsData() !== null);

  // ---------------------------------------------------------------------------
  // Summary cards (template section is currently commented out)
  // ---------------------------------------------------------------------------
  readonly summaryCards = computed(() => {
    const data = this.activeAnalyticsData();
    if (!data) return [];
    return [
      // { label: 'Buy Orders', value: data.buy_count, color: BUY_COLOR },
      // { label: 'Sell Orders', value: data.sell_count, color: SELL_COLOR },
      // { label: 'Buy Volume', value: data.buy_volume, color: '#3B82F6' },
      // { label: 'Sell Volume', value: data.sell_volume, color: '#8B5CF6' },
      { label: 'Total Trades', value: (data.buy_count || 0) + (data.sell_count || 0), color: TOTAL_COLOR },
      { label: 'Total Volume', value: (data.buy_volume || 0) + (data.sell_volume || 0), color: TOTAL_COLOR },
    ];
  });

  // ---------------------------------------------------------------------------
  // Order distribution: bar + pie (count / volume)
  // ---------------------------------------------------------------------------
  private readonly buySellValues = computed(() => {
    const data = this.activeAnalyticsData();
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
        percentage: total > 0 ? (v.buy / total) * 100 : 0,
      },
      {
        path: this.slicePath(start + buyAngle, start + (total > 0 ? 2 * Math.PI : 0)),
        color: SELL_COLOR,
        label: 'Sell',
        value: v.sell,
        percentage: total > 0 ? (v.sell / total) * 100 : 0,
      },
    ];
  });

  // ---------------------------------------------------------------------------
  // Order volume by 30 minute market interval (volume / side)
  // ---------------------------------------------------------------------------
  readonly marketHoursChart = computed<BarChartModel>(() => {
    const data = this.activeAnalyticsData();
    const sides = data?.volume_by_market_interval_and_side;
    if (!sides) return EMPTY_CHART;

    const buyData = sides['BUY'] ?? {};
    const sellData = sides['SELL'] ?? {};

    const keys = [...Object.keys(buyData), ...Object.keys(sellData)]
      .map(Number)
      .filter((n) => Number.isFinite(n) && n >= 1 && n <= 13);
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
    const data = this.activeAnalyticsData();
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
    const data = this.activeAnalyticsData();
    if (!data || !data.top_5_most_traded_assets) return [];

    const assets = this.topAssetsMode() === 'total'
      ? data.top_5_most_traded_assets
      : data.top_5_most_traded_assets_by_side?.[this.topAssetsMode().toUpperCase() as 'BUY' | 'SELL'] ?? {};

    return Object.entries(assets)
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

  private escapeHtml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
