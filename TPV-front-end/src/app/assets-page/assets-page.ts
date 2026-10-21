import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetResultComponent, AssetTradeDetails } from '../asset-result/asset-result';

@Component({
	standalone: true,
	imports: [CommonModule, FormsModule, AssetResultComponent],
	selector: 'app-assets-page',
	styleUrl: './assets-page.scss',
	templateUrl: './assets-page.html',
})
export class AssetsPage {
	private router = inject(Router);
	private route = inject(ActivatedRoute);

	searchTicker = '';
	activeTicker = '';
	searchError = '';

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
		const ticker = this.searchTicker.trim().toUpperCase();

		if (!ticker) {
			this.searchError = 'Enter a ticker symbol to search.';
			return;
		}

		this.searchError = '';
		this.activeTicker = ticker;
	}

	openTradeModal(details: AssetTradeDetails): void {
		this.router.navigate(['/trade'], {
			queryParams: { ticker: details.symbol },
		});
	}
}