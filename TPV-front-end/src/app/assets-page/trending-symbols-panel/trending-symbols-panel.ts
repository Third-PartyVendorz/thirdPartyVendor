import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MarketQuoteData } from '../../dto/MarketQuoteAPIResponse';
import { TrendingTickerResponse } from '../../dto/TrendingTickerResponse';
import { MarketApiService } from '../../services/marketApi.service';
import { TrendingService } from '../../services/trending.service';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export type TrendingCard = {
	symbol: string;
	orderCount: number;
	price: number | null;
	changePercent: number | null;
	currency: string;
};

@Component({
	standalone: true,
	imports: [CommonModule],
	selector: 'app-trending-symbols-panel',
	styleUrl: './trending-symbols-panel.scss',
	templateUrl: './trending-symbols-panel.html',
})
export class TrendingSymbolsPanel implements OnInit {
	private readonly destroyRef = inject(DestroyRef);
	private readonly marketApiService = inject(MarketApiService);
	private readonly trendingService = inject(TrendingService);

	readonly tickers = signal<TrendingCard[]>([]);
	readonly loading = signal(false);
	readonly error = signal('');

	@Output() exploreTicker = new EventEmitter<string>();
	@Output() tradeTicker = new EventEmitter<string>();

	ngOnInit(): void {
		const to = new Date();
		const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);

		this.loading.set(true);
		this.trendingService.fetchTrendingTickers(from, to, 3)
			.pipe(
				switchMap((rows) => this.withQuotes(rows)),
				takeUntilDestroyed(this.destroyRef),
			)
			.subscribe({
				next: (tickers) => {
					this.tickers.set(tickers);
					this.loading.set(false);
				},
				error: () => {
					this.error.set('Trending symbols could not be loaded.');
					this.loading.set(false);
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
			changePercent: quote?.changePercent ?? null,
			currency: quote?.currency || 'USD',
		};
	}
}