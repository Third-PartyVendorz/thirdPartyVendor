import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../navbar/navbar';
import { AssetResultComponent, AssetTradeDetails } from '../asset-result/asset-result';
import { TradeModalComponent } from '../trade-page/trade-modal/trade-modal.component';

@Component({
	standalone: true,
	imports: [CommonModule, FormsModule, Navbar, AssetResultComponent, TradeModalComponent],
	selector: 'app-assets-page',
	styleUrl: './assets-page.scss',
	templateUrl: './assets-page.html',
})
export class AssetsPage {
	searchTicker = '';
	activeTicker = '';
	searchError = '';
	isTradeModalOpen = signal(false);
	tradeModalTicker = signal('');
	tradeModalAssetDetails = signal<AssetTradeDetails | null>(null);

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
		this.tradeModalAssetDetails.set(details);
		this.tradeModalTicker.set(details.symbol);
		this.isTradeModalOpen.set(true);
	}

	closeTradeModal(): void {
		this.isTradeModalOpen.set(false);
	}
}