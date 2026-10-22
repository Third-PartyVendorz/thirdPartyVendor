import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, signal, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssetResultComponent, AssetTradeDetails } from '../asset-result/asset-result';
import { TradeFormComponent } from './trade-form/trade-form.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';
import { FrozenAccountModal } from '../shared/frozen-account-modal/frozen-account-modal';
import { PageHeader } from '../shared/page-header/page-header';
import { CustomSliderComponent } from '../shared/custom-slider/custom-slider';
import { MarketStatus } from '../shared/market-status/market-status';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MarketApiService } from '../services/marketApi.service';
import { MarketQuoteData } from '../dto/MarketQuoteAPIResponse';
import { TrendingService } from '../services/trending.service';
import { TrendingTickerResponse } from '../dto/TrendingTickerResponse';

export interface TrendingCard {
	symbol: string;
	orderCount: number;
	price: number | null;
	change: number | null;
	changePercent: number | null;
	currency: string;
}

@Component({
	standalone: true,
	imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, AssetResultComponent, TradeFormComponent, FrozenAccountModal, PageHeader, CustomSliderComponent, MarketStatus, RouterLink],
	selector: 'app-trade-page',
	styleUrl: './trade-page.component.scss',
	templateUrl: './trade-page.component.html',
})
export class TradePage implements OnInit {
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private destroyRef = inject(DestroyRef);
	private authService = inject(AuthService);
	private trendingService = inject(TrendingService);
	private marketApiService = inject(MarketApiService);

	searchTicker = '';
	cryptoCurrency = 'USD';
	marketType: 'equity' | 'crypto' = 'equity';
	activeTicker = '';
	searchError = '';
	assetDetails = signal<AssetTradeDetails | null>(null);
	sharesOwned = signal(0);
	autoOpenTrade = true;
	showFrozenAccountModal = false;

	readonly trendingTickers = signal<TrendingCard[]>([]);
	readonly trendingLoading = signal(false);
	readonly trendingError = signal('');
	private readonly trendingWindowMs = 24 * 60 * 60 * 1000;
	private readonly trendingLimit = 5;

	ngOnInit(): void {
		this.loadTrendingTickers();

		if (this.authService.isFrozen()) {
			this.showFrozenAccountModal = true;
		}

		this.route.queryParams
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((params) => {
				if (params['ticker']) {
					const ticker = params['ticker'].trim().toUpperCase();
					this.marketType = ticker.startsWith('X:') ? 'crypto' : 'equity';
					if (this.marketType === 'crypto') {
						const [cryptoTicker, currency] = ticker.slice(2).split('-');
						this.searchTicker = cryptoTicker ?? '';
						this.cryptoCurrency = currency || 'USD';
					} else {
						this.searchTicker = ticker;
					}
					this.activeTicker = ticker;
				} else {
					// Clear state when no ticker param
					this.searchTicker = '';
					this.activeTicker = '';
					this.searchError = '';
					this.assetDetails.set(null);
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

	private loadTrendingTickers(): void {
		const to = new Date();
		const from = new Date(to.getTime() - this.trendingWindowMs);

		this.trendingLoading.set(true);
		this.trendingError.set('');

		this.trendingService.fetchTrendingTickers(from, to, this.trendingLimit)
			.pipe(
				switchMap((rows) => this.withQuotes(rows)),
				takeUntilDestroyed(this.destroyRef),
			)
			.subscribe({
				next: (cards) => {
					this.trendingTickers.set(cards);
					this.trendingLoading.set(false);
				},
				error: () => {
					this.trendingTickers.set([]);
					this.trendingError.set('Trending symbols could not be loaded.');
					this.trendingLoading.set(false);
				},
			});
	}

	private withQuotes(rows: TrendingTickerResponse[]): Observable<TrendingCard[]> {
		if (!rows.length) {
			return of([]);
		}

		return this.marketApiService.fetchQuotes(rows.map((row) => row.ticker)).pipe(
			map((response) => {
				const quoteBySymbol = new Map<string, MarketQuoteData | null>(
					(response.data?.quotes ?? []).map((item): [string, MarketQuoteData | null] => [item.symbol.toUpperCase(), item.quote]),
				);
				return rows.map((row) => this.toTrendingCard(row, quoteBySymbol.get(row.ticker) ?? null));
			}),
			catchError(() => of(rows.map((row) => this.toTrendingCard(row, null)))),
		);
	}

	private toTrendingCard(row: TrendingTickerResponse, quote: MarketQuoteData | null): TrendingCard {
		return {
			symbol: row.ticker,
			orderCount: row.orderCount,
			price: quote?.price ?? null,
			change: quote?.change ?? null,
			changePercent: quote?.changePercent ?? null,
			currency: quote?.currency || 'USD',
		};
	}

	private buildTicker(): string {
		const symbol = this.searchTicker.trim().toUpperCase();
		if (this.marketType === 'crypto') {
			const currency = this.cryptoCurrency.trim().toUpperCase() || 'USD';
			return `X:${symbol}-${currency}`;
		}

		return symbol;
	}

	onAssetLoaded(details: AssetTradeDetails): void {
		this.assetDetails.set(details);
	}

	onTickerNotFound(ticker: string): void {
		this.searchError = `Ticker "${ticker}" could not be found.`;
		this.assetDetails.set(null);
	}

	onPositionChanged(shares: number): void {
		this.sharesOwned.set(shares);
	}
}
