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
import { WatchlistService } from '../services/watchlist.service';
import { MessageService } from '../services/message.service';
import { MarketApiService } from '../services/marketApi.service';
import { OrderResponse } from '../dto/OrderResponse';
import { MarketQuoteData } from '../dto/MarketQuoteAPIResponse';
import { TrendingSymbolsPanel } from './trending-symbols-panel/trending-symbols-panel';
import { forkJoin, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, retry, startWith, timeout } from 'rxjs/operators';
import { CustomSliderComponent } from '../shared/custom-slider/custom-slider';
import { MarketStatus } from '../shared/market-status/market-status';

type WatchlistAsset = {
	symbol: string;
	name: string;
	price: number | null;
	change: number | null;
	changePercent: number | null;
	currency: string;
	marketState: string;
};

const RECENT_SEARCHES_KEY = 'tpv.recentAssetSearches';
const RECENT_SEARCHES_LIMIT = 5;

function readRecentSearches(): string[] {
	try {
		const stored: unknown = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]');
		return Array.isArray(stored) ? stored.filter((ticker): ticker is string => typeof ticker === 'string').slice(0, RECENT_SEARCHES_LIMIT) : [];
	} catch {
		return [];
	}
}

function storeRecentSearches(tickers: string[]): void {
	try {
		localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(tickers));
	} catch {
		// Storage may be blocked; the list then lasts only for this page load.
	}
}

@Component({
	standalone: true,
	imports: [CommonModule, FormsModule, AssetResultComponent, PageHeader, CustomSliderComponent, MarketStatus, TrendingSymbolsPanel],
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
	private watchlistService = inject(WatchlistService);
	private marketApiService = inject(MarketApiService);
	private messageService = inject(MessageService);

	readonly watchlistAssets = signal<WatchlistAsset[]>([]);
	readonly watchlistLoading = signal(false);
	readonly watchlistSaving = signal(false);
	readonly watchlistError = signal('');
	readonly watchlistLimit = 25;
	readonly recentSearches = signal<string[]>(readRecentSearches());
	private selectedWatchlist = new Set<string>();

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
		this.loadWatchlist();
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

	private loadWatchlist(): void {
		this.watchlistLoading.set(true);
		this.watchlistError.set('');
		this.watchlistService.getWatchlist()
			.pipe(
				catchError(() => {
					this.watchlistError.set('Your watchlist could not be loaded.');
					return of([] as string[]);
				}),
				takeUntilDestroyed(this.destroyRef),
			)
			.subscribe((symbols) => {
				this.selectedWatchlist = new Set([...this.selectedWatchlist].filter((symbol) => symbols.includes(symbol)));
				this.loadWatchlistAssets(symbols);
			});
	}

	private loadWatchlistAssets(symbols: string[]): void {
		if (!symbols.length) {
			this.watchlistAssets.set([]);
			this.watchlistLoading.set(false);
			return;
		}

		this.marketApiService.fetchQuotes(symbols)
			.pipe(
				catchError((error: unknown) => of(this.partialQuotesFromError(error) ?? { data: {} } as const)),
				takeUntilDestroyed(this.destroyRef),
			)
			.subscribe((quotes) => {
				const quoteBySymbol = this.quotesBySymbol(quotes);
				const missingQuotes = symbols.some((symbol) => !quoteBySymbol.get(symbol.toUpperCase()));
				this.watchlistError.set(missingQuotes ? 'Some watchlist quotes could not be loaded.' : '');
				this.watchlistAssets.set(symbols.map((symbol) => this.toWatchlistAsset(symbol, quoteBySymbol.get(symbol.toUpperCase()) ?? null)));
				this.watchlistLoading.set(false);
			});
	}

	private quotesBySymbol(response: unknown): Map<string, MarketQuoteData> {
		const result = new Map<string, MarketQuoteData>();
		let payload = response;

		if (typeof payload === 'object' && payload !== null && !Array.isArray(payload) && 'data' in payload) {
			payload = payload.data;
		}
		if (typeof payload === 'object' && payload !== null && !Array.isArray(payload) && 'quotes' in payload) {
			payload = payload.quotes;
		}

		if (Array.isArray(payload)) {
			for (const item of payload) {
				if (typeof item !== 'object' || item === null || !('symbol' in item) || typeof item.symbol !== 'string') {
					continue;
				}

				const quote = 'quote' in item ? item.quote : null;
				if (typeof quote === 'object' && quote !== null && 'price' in quote) {
					result.set(item.symbol.toUpperCase(), quote as MarketQuoteData);
				}
			}

			return result;
		}

		if (typeof payload === 'object' && payload !== null) {
			for (const [symbol, value] of Object.entries(payload)) {
				if (typeof value === 'object' && value !== null && 'price' in value) {
					result.set(symbol.toUpperCase(), value as MarketQuoteData);
				}
			}
		}

		return result;
	}

	private partialQuotesFromError(error: unknown): unknown | null {
		if (typeof error !== 'object' || error === null || !('error' in error)) {
			return null;
		}

		return error.error;
	}

	private toWatchlistAsset(symbol: string, quote: MarketQuoteData | null = null): WatchlistAsset {
		return {
			symbol,
			name: symbol,
			price: quote?.price ?? null,
			change: quote?.change ?? null,
			changePercent: quote?.changePercent ?? null,
			currency: quote?.currency || 'USD',
			marketState: quote?.marketState || 'unavailable',
		};
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

	tradeTrendingTicker(symbol: string): void {
		this.router.navigate(['/trade'], { queryParams: { ticker: symbol } });
	}

	clearActiveAsset(): void {
		if (this.activityRetryTimer) {
			clearTimeout(this.activityRetryTimer);
		}
		this.activeTicker = '';
		this.activityTicker = '';
		this.searchError = '';
		this.router.navigate([], { relativeTo: this.route, queryParams: {} });
	}

	isWatchlisted(symbol: string): boolean {
		return this.watchlistAssets().some((asset) => asset.symbol === symbol);
	}

	isWatchlistSelected(symbol: string): boolean {
		return this.selectedWatchlist.has(symbol);
	}

	allWatchlistSelected(): boolean {
		return this.watchlistAssets().length > 0 && this.selectedWatchlist.size === this.watchlistAssets().length;
	}

	someWatchlistSelected(): boolean {
		return this.selectedWatchlist.size > 0 && !this.allWatchlistSelected();
	}

	toggleWatchlistSelection(symbol: string): void {
		if (this.selectedWatchlist.has(symbol)) {
			this.selectedWatchlist.delete(symbol);
		} else {
			this.selectedWatchlist.add(symbol);
		}
	}

	toggleAllWatchlistSelection(): void {
		if (this.allWatchlistSelected()) {
			this.selectedWatchlist.clear();
			return;
		}

		this.selectedWatchlist = new Set(this.watchlistAssets().map((asset) => asset.symbol));
	}

	removeSelectedWatchlist(): void {
		const symbols = [...this.selectedWatchlist];
		if (!symbols.length) {
			return;
		}

		this.saveWatchlist(this.watchlistService.removeFromWatchlist(symbols));
	}

	addActiveToWatchlist(): void {
		if (!this.activeTicker || this.isWatchlisted(this.activeTicker)) {
			return;
		}

		if (this.watchlistAtLimit()) {
			this.messageService.setErrorMessage(`Your watchlist is full (${this.watchlistLimit}/${this.watchlistLimit}). Remove an asset to save another.`);
			return;
		}

		this.saveWatchlist(this.watchlistService.addToWatchlist(this.activeTicker));
	}

	removeActiveFromWatchlist(): void {
		if (!this.activeTicker || !this.isWatchlisted(this.activeTicker)) {
			return;
		}

		this.removeSymbolFromWatchlist(this.activeTicker);
	}

	removeSymbolFromWatchlist(symbol: string): void {
		this.saveWatchlist(this.watchlistService.removeFromWatchlist([symbol]));
	}

	watchlistCount(): number {
		return this.watchlistAssets().length;
	}

	watchlistAtLimit(): boolean {
		return this.watchlistCount() >= this.watchlistLimit;
	}

	watchlistFillPercent(): number {
		return Math.min(100, (this.watchlistCount() / this.watchlistLimit) * 100);
	}

	private saveWatchlist(request: ReturnType<WatchlistService['getWatchlist']>): void {
		this.watchlistSaving.set(true);
		request
			.pipe(
				catchError((error) => {
					this.messageService.setErrorMessage(error?.error?.message ?? 'Your watchlist could not be updated.');
					return of(null);
				}),
				takeUntilDestroyed(this.destroyRef),
			)
			.subscribe((symbols) => {
				if (symbols) {
					this.watchlistError.set('');
					this.selectedWatchlist.clear();
					this.loadWatchlistAssets(symbols);
				}
				this.watchlistSaving.set(false);
			});
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

	rememberRecentSearch(ticker: string): void {
		const next = [ticker, ...this.recentSearches().filter((recent) => recent !== ticker)].slice(0, RECENT_SEARCHES_LIMIT);
		this.recentSearches.set(next);
		storeRecentSearches(next);
	}

	clearRecentSearches(): void {
		this.recentSearches.set([]);
		storeRecentSearches([]);
	}

	onAssetFound(ticker: string): void {
		if (this.activeTicker !== ticker) {
			return;
		}

		this.rememberRecentSearch(ticker);
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