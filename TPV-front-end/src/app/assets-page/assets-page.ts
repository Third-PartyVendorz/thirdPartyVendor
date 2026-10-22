import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AssetResultComponent, AssetTradeDetails } from '../asset-result/asset-result';
import { PageHeader } from '../shared/page-header/page-header';
import { Holding } from '../dashboard/holdings-table/holding.model';
import { HoldingService } from '../services/holding.service';
import { OrderService } from '../services/order.service';
import { OrderResponse } from '../dto/OrderResponse';
import { forkJoin, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, retry, startWith, timeout } from 'rxjs/operators';
import { CustomSliderComponent } from '../shared/custom-slider/custom-slider';
import { MarketStatus } from '../shared/market-status/market-status';

@Component({
	standalone: true,
	imports: [CommonModule, FormsModule, AssetResultComponent, PageHeader, CustomSliderComponent, MarketStatus],
	selector: 'app-assets-page',
	styleUrl: './assets-page.scss',
	templateUrl: './assets-page.html',
})
export class AssetsPage implements OnInit {
	private router = inject(Router);
	private route = inject(ActivatedRoute);
	private destroyRef = inject(DestroyRef);
	private holdingService = inject(HoldingService);
	private orderService = inject(OrderService);

	readonly trendingAssets = [
		{ symbol: 'NVDA', name: 'NVIDIA', price: '$182.41', change: '+3.84%', negative: false },
		{ symbol: 'AAPL', name: 'Apple', price: '$342.94', change: '-0.15%', negative: true },
		{ symbol: 'MSFT', name: 'Microsoft', price: '$518.62', change: '+1.26%', negative: false },
		{ symbol: 'TSLA', name: 'Tesla', price: '$412.76', change: '+2.09%', negative: false },
	];

	searchTicker = '';
	cryptoCurrency = 'USD';
	marketType: 'equity' | 'crypto' = 'equity';
	activeTicker = '';
	activityTicker = '';
	searchError = '';
	currentHolding: Holding | null = null;
	securityOrders: OrderResponse[] = [];
	readonly activityLoading = signal(false);
	private activityRetryTimer?: ReturnType<typeof setTimeout>;
	private activityAttempts = 0;
	readonly ordersPerPage = 5;
	orderPage = 1;

	get visibleOrders(): OrderResponse[] {
		const start = (this.orderPage - 1) * this.ordersPerPage;
		return this.securityOrders.slice(start, start + this.ordersPerPage);
	}

	get orderPageCount(): number {
		return Math.max(1, Math.ceil(this.securityOrders.length / this.ordersPerPage));
	}

	ngOnInit(): void {
		this.route.queryParamMap
			.pipe(
				map((params) => params.get('ticker')),
				startWith(this.route.snapshot.queryParamMap.get('ticker')),
				distinctUntilChanged(),
				takeUntilDestroyed(this.destroyRef),
			)
			.subscribe((ticker) => {
				this.applyTickerFromParams(ticker);
			});
	}

	private applyTickerFromParams(value: string | null | undefined): void {
		const ticker = String(value ?? '').trim().toUpperCase();
		this.searchTicker = ticker;
		this.marketType = ticker.startsWith('X:') ? 'crypto' : 'equity';
		if (this.marketType === 'crypto') {
			const [cryptoTicker, currency] = ticker.slice(2).split('-');
			this.searchTicker = cryptoTicker ?? '';
			this.cryptoCurrency = currency || 'USD';
		}
		this.activeTicker = ticker;
		this.activityTicker = '';
	}

	constructor() {
		this.route.queryParamMap.subscribe(params => {
			const ticker = params.get('ticker')?.trim().toUpperCase();
			if (ticker) {
				this.searchTicker = ticker;
				this.activeTicker = ticker;
				this.searchError = '';
			}
		});
	}

	submitSearch(): void {
		const ticker = this.buildTicker();

		if (!ticker) {
			this.searchError = 'Enter a ticker to search.';
			return;
		}

		this.searchError = '';
		this.activeTicker = ticker;
		this.activityTicker = '';
		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: { ticker },
			queryParamsHandling: 'merge',
		});
	}

	setMarketType(type: string): void {
		if (type !== 'equity' && type !== 'crypto') {
			return;
		}
		this.marketType = type;
		this.searchTicker = '';
		if (type === 'crypto') {
			this.cryptoCurrency = 'USD';
		}
	}

	selectPopular(symbol: string): void {
		this.marketType = 'equity';
		this.searchTicker = symbol;
		this.submitSearch();
	}

	private buildTicker(): string {
		const symbol = this.searchTicker.trim().toUpperCase();
		if (this.marketType === 'crypto') {
			const currency = this.cryptoCurrency.trim().toUpperCase() || 'USD';
			return `X:${symbol}-${currency}`;
		}

		return symbol;
	}

	private loadUserActivity(ticker: string): void {
		if (this.activityRetryTimer) {
			clearTimeout(this.activityRetryTimer);
		}
		this.activityAttempts = 0;
		this.beginActivityLoad(ticker);
	}

	onAssetFound(ticker: string): void {
		if (this.activeTicker !== ticker) {
			return;
		}

		this.activityTicker = ticker;
		this.loadUserActivity(ticker);
	}

	onTickerNotFound(ticker: string): void {
		if (this.activeTicker === ticker) {
			this.activityTicker = '';
		}
	}

	private beginActivityLoad(ticker: string): void {
		this.currentHolding = null;
		this.securityOrders = [];
		this.orderPage = 1;
		this.activityLoading.set(Boolean(ticker));

		if (!ticker) {
			return;
		}

		if (this.activityAttempts < 2) {
			this.activityRetryTimer = setTimeout(() => {
				if (this.activityLoading() && this.activeTicker === ticker) {
					this.activityAttempts += 1;
					this.beginActivityLoad(ticker);
				}
			}, 2500);
		} else {
			this.activityRetryTimer = setTimeout(() => {
				if (this.activeTicker === ticker) {
					this.activityLoading.set(false);
				}
			}, 3000);
		}

		forkJoin({
			holdings: this.holdingService.fetchHoldingsFromAPI().pipe(
				timeout(1500),
				retry({ count: 4, delay: 500 }),
				catchError(() => of([])),
			),
			orders: this.orderService.fetchOrders().pipe(
				timeout(1500),
				retry({ count: 4, delay: 500 }),
				catchError(() => of([])),
			),
		})
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(({ holdings, orders }) => {
				this.currentHolding = holdings.find((holding) => holding.ticker.toUpperCase() === ticker) ?? null;
				this.securityOrders = orders
					.filter((order) => order.ticker.toUpperCase() === ticker)
					.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
				this.orderPage = 1;
			})
			.add(() => {
				this.activityLoading.set(false);
				if (this.activityRetryTimer) {
					clearTimeout(this.activityRetryTimer);
				}
			});
	}

	previousOrderPage(): void {
		this.orderPage = Math.max(1, this.orderPage - 1);
	}

	nextOrderPage(): void {
		this.orderPage = Math.min(this.orderPageCount, this.orderPage + 1);
	}

	orderAmount(order: OrderResponse): number {
		const quantity = order.executionQuantity ?? order.quantity ?? 0;
		const price = order.executionPrice ?? order.orderPrice ?? 0;
		return quantity * price;
	}

	openTradeModal(details: AssetTradeDetails): void {
		this.router.navigate(['/trade'], {
			queryParams: { ticker: details.symbol },
		});
	}
}