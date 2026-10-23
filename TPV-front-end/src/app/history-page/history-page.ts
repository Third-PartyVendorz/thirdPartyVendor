import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { OrderResponse } from '../dto/OrderResponse';
import { MessageService } from '../services/message.service';
import { OrderService } from '../services/order.service';
import { PageHeader } from '../shared/page-header/page-header';
import { TradeService } from '../trade-page/trade.service';
import { CashTransactionResponse } from '../dto/CashTransactionResponse';

type OrderHistoryEntry = {
  orderId: number;
  date: string;
  time: string;
  ticker: string;
  side: 'Buy' | 'Sell';
  quantity: string;
  price: string;
  total: string;
  status: 'Filled' | 'Pending' | 'Cancelled';
  statusClass: 'filled' | 'pending' | 'cancelled';
  venue: string;
  createdAt: Date;
  netAmount: number;
};

type TrendPoint = {
  label: string;
  value: number;
};

type HistoryFilter = 'All orders' | 'Filled' | 'Pending' | 'Cancelled';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, PageHeader],
  templateUrl: './history-page.html',
  styleUrl: './history-page.scss',
})
export class HistoryPage implements OnInit {

  constructor(
    private orderService: OrderService,
    private tradeService: TradeService,
    private messageService: MessageService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  readonly chartWidth = 640;
  readonly chartHeight = 280;
  readonly chartPadding = 24;

  selectedFilter: HistoryFilter = 'All orders';
  isLoadingOrders = false;
  readonly pendingCancellation = signal<OrderHistoryEntry | null>(null);
  private readonly cancellingOrderIds = new Set<number>();
  private allHistoryEntries: OrderHistoryEntry[] = [];
  recentCashTransactions: CashTransactionResponse[] = [];
  isLoadingCashTransactions = false;

  readonly quickFilters: HistoryFilter[] = ['All orders', 'Filled', 'Pending', 'Cancelled'];

  ngOnInit(): void {
    this.loadOrders();
    this.loadRecentCashTransactions();
  }

  loadRecentCashTransactions(): void {
    this.isLoadingCashTransactions = true;
    this.tradeService.getRecentCashTransactions()
      .pipe(finalize(() => {
        this.isLoadingCashTransactions = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (transactions) => {
          this.recentCashTransactions = transactions;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.recentCashTransactions = [];
          console.error('Unable to load recent cash transactions:', error);
          this.cdr.markForCheck();
        },
      });
  }

  get summaryCards() {
    const ordersPlaced = this.allHistoryEntries.length;
    const filledToday = this.allHistoryEntries.filter((entry) => entry.status === 'Filled' && this.isSameDay(entry.createdAt, new Date())).length;
    const pendingReview = this.allHistoryEntries.filter((entry) => entry.status === 'Pending').length;
    const netTraded = this.allHistoryEntries.reduce((total, entry) => total + entry.netAmount, 0);

    return [
      { label: 'Orders placed', value: String(ordersPlaced), detail: 'Total orders on file' },
      { label: 'Filled today', value: String(filledToday), detail: `${this.fillRate}% fill rate` },
      { label: 'Pending review', value: String(pendingReview), detail: 'Waiting on market' },
      { label: 'Net traded', value: this.formatCurrency(netTraded), detail: '30 day rolling total' },
    ];
  }

  get historyEntries(): OrderHistoryEntry[] {
    if (this.selectedFilter === 'All orders') {
      return this.allHistoryEntries;
    }

    return this.allHistoryEntries.filter((entry) => entry.status === this.selectedFilter);
  }

  get activityFeed() {
    return this.allHistoryEntries.slice(0, 3).map((entry) => ({
      title: `Order ${entry.status.toLowerCase()}`,
      description: `${entry.ticker} ${entry.side.toLowerCase()} order ${entry.status.toLowerCase()}.`,
      timestamp: this.formatRelativeTime(entry.createdAt),
    }));
  }

  get fillRate(): number {
    if (this.allHistoryEntries.length === 0) {
      return 0;
    }

    const filledOrders = this.allHistoryEntries.filter((entry) => entry.status === 'Filled').length;
    return Math.round((filledOrders / this.allHistoryEntries.length) * 100);
  }

  get trendPoints(): TrendPoint[] {
    if (this.allHistoryEntries.length === 0) {
      return [{ label: this.formatMonth(new Date()), value: 0 }];
    }

    const monthlyNetAmounts = new Map<string, { date: Date; amount: number }>();

    for (const entry of this.allHistoryEntries) {
      const monthStart = new Date(entry.createdAt.getFullYear(), entry.createdAt.getMonth(), 1);
      const monthKey = `${monthStart.getFullYear()}-${monthStart.getMonth()}`;
      const month = monthlyNetAmounts.get(monthKey) ?? { date: monthStart, amount: 0 };
      month.amount += entry.side === 'Buy' ? entry.netAmount : -entry.netAmount;
      monthlyNetAmounts.set(monthKey, month);
    }

    const monthlyEntries = Array.from(monthlyNetAmounts.values())
      .sort((left, right) => left.date.getTime() - right.date.getTime());
    let cumulativeValue = 0;

    return monthlyEntries.map((month) => {
      cumulativeValue += month.amount;
      return {
        label: this.formatMonth(month.date),
        value: cumulativeValue,
      };
    }).slice(-10);
  }

  loadOrders(): void {
    this.isLoadingOrders = true;
    this.orderService.fetchOrders()
      .pipe(finalize(() => {
        this.isLoadingOrders = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (orders) => {
          this.allHistoryEntries = orders
            .map((order) => this.mapOrderToHistoryEntry(order))
            .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.allHistoryEntries = [];
          this.messageService.setErrorMessage(error?.error?.message ?? 'Unable to load order history.');
          this.cdr.markForCheck();
        },
      });
  }


  selectFilter(filter: HistoryFilter): void {
    this.selectedFilter = filter;
  }

  isCancelling(orderId: number): boolean {
    return this.cancellingOrderIds.has(orderId);
  }

  requestOrderCancellation(entry: OrderHistoryEntry): void {
    if (entry.status !== 'Pending' || this.isCancelling(entry.orderId)) {
      return;
    }

    this.pendingCancellation.set(entry);
  }

  dismissCancellation(): void {
    const entry = this.pendingCancellation();
    if (entry && this.isCancelling(entry.orderId)) {
      return;
    }

    this.pendingCancellation.set(null);
  }

  confirmCancellation(): void {
    const entry = this.pendingCancellation();
    if (!entry || entry.status !== 'Pending' || this.isCancelling(entry.orderId)) {
      return;
    }

    this.cancellingOrderIds.add(entry.orderId);
    this.orderService.cancelOrder(entry.orderId)
      .pipe(finalize(() => {
        this.cancellingOrderIds.delete(entry.orderId);
        this.pendingCancellation.set(null);
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (order) => {
          entry.status = this.mapStatus(order.status);
          entry.statusClass = this.getStatusClass(entry.status);
          this.messageService.setSuccessMessage(`${entry.ticker} order cancelled.`);
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.messageService.setErrorMessage(error?.error?.message ?? 'Unable to cancel order.');
          this.cdr.markForCheck();
        },
      });
  }

  downloadCsv(): void {
    if (this.historyEntries.length === 0) {
      this.messageService.setErrorMessage('No orders are available to export.');
      return;
    }

    const header = ['Date', 'Time', 'Ticker', 'Side', 'Qty', 'Price', 'Total', 'Status', 'Venue'];
    const rows = this.historyEntries.map((entry) => [
      entry.date,
      entry.time,
      entry.ticker,
      entry.side,
      entry.quantity,
      entry.price,
      entry.total,
      entry.status,
      entry.venue,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => this.escapeCsv(String(value))).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'order-history.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  openNewOrder(): void {
    this.router.navigateByUrl('/trade');
  }

  getStatusClass(status: OrderHistoryEntry['status']): OrderHistoryEntry['statusClass'] {
    return status.toLowerCase().replace(/\s+/g, '-') as OrderHistoryEntry['statusClass'];
  }

  private mapOrderToHistoryEntry(order: OrderResponse): OrderHistoryEntry {
    const createdAt = new Date(order.createdAt);
    const status = this.mapStatus(order.status);
    const amount = this.resolveNetAmount(order);

    return {
      orderId: order.orderId,
      date: this.formatDate(createdAt),
      time: this.formatTime(createdAt),
      ticker: order.ticker,
      side: order.orderIntent === 'BUY' ? 'Buy' : 'Sell',
      quantity: this.formatQuantity(order.quantity),
      price: this.formatOptionalCurrency(order.orderPrice),
      total: this.formatOptionalCurrency(order.orderPrice),
      status,
      statusClass: this.getStatusClass(status),
      venue: order.orderCurrency,
      createdAt,
      netAmount: amount,
    };
  }

  private mapStatus(status: OrderResponse['status']): OrderHistoryEntry['status'] {
    if (status === 'FILLED') {
      return 'Filled';
    }

    if (status === 'PENDING') {
      return 'Pending';
    }

    return 'Cancelled';
  }

  private resolveNetAmount(order: OrderResponse): number {
    if (order.executionPrice !== null && order.executionQuantity !== null) {
      return order.executionPrice * order.executionQuantity;
    }
    return order.orderPrice ?? 0;
  }

  private formatQuantity(quantity: number | null): string {
    return quantity === null ? '—' : quantity.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
  }

  private formatOptionalCurrency(value: number | null): string {
    if (value === null) {
      return '—';
    }

    return this.formatCurrency(value);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private formatMonth(date: Date): string {
    return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  }

  private formatRelativeTime(date: Date): string {
    const diffInMinutes = Math.round((Date.now() - date.getTime()) / 60000);

    if (diffInMinutes < 1) {
      return 'Just now';
    }

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }

    const diffInHours = Math.round(diffInMinutes / 60);

    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }

    const diffInDays = Math.round(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  formatCashTransactionType(type: CashTransactionResponse['type']): string {
    return type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal';
  }

  formatCashTransactionAmount(transaction: CashTransactionResponse): string {
    const sign = transaction.type === 'DEPOSIT' ? '+' : '-';
    return `${sign}${this.formatCurrency(transaction.amount)}`;
  }

  private isSameDay(left: Date, right: Date): boolean {
    return left.getFullYear() === right.getFullYear()
      && left.getMonth() === right.getMonth()
      && left.getDate() === right.getDate();
  }

  private escapeCsv(value: string): string {
    if (value.includes('"') || value.includes(',') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
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
