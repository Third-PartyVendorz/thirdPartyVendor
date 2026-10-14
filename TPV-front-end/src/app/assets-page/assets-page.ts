import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../navbar/navbar';
import { AssetResultComponent } from '../asset-result/asset-result';

@Component({
	standalone: true,
	imports: [CommonModule, FormsModule, Navbar, AssetResultComponent],
	selector: 'app-assets-page',
	styleUrl: './assets-page.scss',
	templateUrl: './assets-page.html',
})
export class AssetsPage {
	searchTicker = '';
	activeTicker = '';
	searchError = '';

	submitSearch(): void {
		const ticker = this.searchTicker.trim().toUpperCase();

		if (!ticker) {
			this.searchError = 'Enter a ticker symbol to search.';
			return;
		}

		this.searchError = '';
		this.activeTicker = ticker;
	}
}