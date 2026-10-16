import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, signal, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetResultComponent, AssetTradeDetails } from '../asset-result/asset-result';
import { TradeFormComponent } from './trade-form/trade-form.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomSliderComponent } from '../shared/custom-slider/custom-slider';

@Component({
	standalone: true,
	imports: [CommonModule, FormsModule, CurrencyPipe, AssetResultComponent, TradeFormComponent, CustomSliderComponent],
	selector: 'app-trade-page',
	styleUrl: './trade-page.component.scss',
	templateUrl: './trade-page.component.html',
})
export class TradePage implements OnInit {
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private destroyRef = inject(DestroyRef);

	searchTicker = '';
	activeTicker = '';
	searchError = '';
	assetDetails = signal<AssetTradeDetails | null>(null);
	sharesOwned = signal(0);
	autoOpenTrade = true;
x: any;

	ngOnInit(): void {
		this.route.queryParams
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((params) => {
				if (params['ticker']) {
					const ticker = params['ticker'].trim().toUpperCase();
					this.searchTicker = ticker;
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
		const ticker = this.searchTicker.trim().toUpperCase();

		if (!ticker) {
			this.searchError = 'Enter a ticker symbol to search.';
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
