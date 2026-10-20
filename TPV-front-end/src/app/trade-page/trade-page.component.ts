import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, signal, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetResultComponent, AssetTradeDetails } from '../asset-result/asset-result';
import { TradeFormComponent } from './trade-form/trade-form.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';
import { FrozenAccountModal } from '../shared/frozen-account-modal/frozen-account-modal';
import { PageHeader } from '../shared/page-header/page-header';
import { CustomSliderComponent } from '../shared/custom-slider/custom-slider';

@Component({
	standalone: true,
	imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, AssetResultComponent, TradeFormComponent, FrozenAccountModal, PageHeader, CustomSliderComponent],
	selector: 'app-trade-page',
	styleUrl: './trade-page.component.scss',
	templateUrl: './trade-page.component.html',
})
export class TradePage implements OnInit {
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private destroyRef = inject(DestroyRef);
	private authService = inject(AuthService);

	searchTicker = '';
	cryptoCurrency = 'USD';
	marketType: 'equity' | 'crypto' = 'equity';
	activeTicker = '';
	searchError = '';
	assetDetails = signal<AssetTradeDetails | null>(null);
	sharesOwned = signal(0);
	autoOpenTrade = true;
	showFrozenAccountModal = false;

	readonly watchlist = [
		{ symbol: 'NVDA', name: 'NVIDIA', price: '$182.41', change: '+3.84%', negative: false },
		{ symbol: 'AAPL', name: 'Apple', price: '$342.94', change: '-0.15%', negative: true },
		{ symbol: 'MSFT', name: 'Microsoft', price: '$518.62', change: '+1.26%', negative: false },
		{ symbol: 'TSLA', name: 'Tesla', price: '$412.76', change: '+2.09%', negative: false },
	];

	ngOnInit(): void {
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
