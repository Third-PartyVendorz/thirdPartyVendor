import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioSummary } from '../portfolio-summary/portfolio-summary';
import { Navbar } from '../../navbar/navbar';
import { HoldingsTable } from '../holdings-table/holdings-table';
import { ForexHoldings } from '../forex-holdings/forex-holdings';
import { PortfolioGraphics } from '../portfolio-graphics/portfolio-graphics';
import { HoldingService } from '../../services/holding.service';
import { Holding } from '../holdings-table/holding.model';
import { PageHeader } from '../../shared/page-header/page-header';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TradeService } from '../../trade-page/trade.service';
// import { Trade } from '../../trade-page/'
import { MarketApiService } from '../../services/marketApi.service';
import { switchMap, forkJoin, catchError, map } from 'rxjs';
import { of } from 'rxjs';
import { MarketQuoteAPIResponse } from '../../dto/MarketQuoteAPIResponse';
import { MarketSymbolAPIResponse } from '../../dto/MarketSymbolAPIResponse';
import { HoldingResponse } from '../../dto/HoldingResponse';

@Component({
  standalone: true,
  imports: [CommonModule, Navbar, PortfolioSummary, HoldingsTable, ForexHoldings, PortfolioGraphics],
  selector: 'app-dashboard-page',
  styleUrl: './dashboard-page.scss',
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage implements OnInit {
  holdings: Holding[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private holdingService: HoldingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private marketApiService: MarketApiService
  ) {}

  ngOnInit(): void {
    this.loadHoldings();
  }

  loadHoldings(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();
    
    this.holdingService.fetchHoldingsFromAPI().pipe(
      map((holdingResponses: HoldingResponse[]): Holding[] => holdingResponses.map(response => ({
        userId: response.userId,
        security: response.security,
        ticker: response.ticker,
        assetType: response.assetType,
        numShares: response.numShares,
        costBasis: response.costBasis ?? 0,
        realizedGainLoss: response.realizedGainLoss ?? 0
      }))),
      switchMap((holdings: Holding[]) => {
        // Create observables for all market quote AND asset info requests
        const quoteRequests: { [key: string]: any } = {};
        const assetRequests: { [key: string]: any } = {};

        holdings.forEach(holding => {
          // Fetch quote data (price, change, etc.)
          quoteRequests[holding.ticker] = this.marketApiService.fetchQuote(holding.ticker).pipe(
            catchError(error => {
              console.error(`Error fetching quote for ${holding.ticker}:`, {
                status: error.status,
                statusText: error.statusText,
                message: error.message,
                url: error.url,
                error: error.error
              });
              return of(null);
            })
          );

          // Fetch asset info (company name, symbol data, etc.)
          assetRequests[holding.ticker] = this.marketApiService.fetchAssetInfo(holding.ticker).pipe(
            catchError(error => {
              console.error(`Error fetching asset info for ${holding.ticker}:`, {
                status: error.status,
                statusText: error.statusText,
                message: error.message,
                url: error.url,
                error: error.error
              });
              return of(null);
            })
          );
        });

        // Wait for all requests to complete
        return forkJoin({
          quotes: forkJoin(quoteRequests),
          assets: forkJoin(assetRequests)
        }).pipe(
          switchMap((result) => {
            const quoteResponses = result.quotes as Record<string, MarketQuoteAPIResponse | null>;
            const assetResponses = result.assets as Record<string, MarketSymbolAPIResponse | null>;
            
            // Merge both quote and asset data into holdings
            holdings.forEach(holding => {
              const quoteResponse = quoteResponses[holding.ticker];
              const assetResponse = assetResponses[holding.ticker];

              // Apply quote data
              if (quoteResponse && quoteResponse.data) {
                const marketData = quoteResponse.data;
                holding.price = marketData.price;
                holding.change = marketData.change;
                holding.dailyChangePercent = marketData.changePercent;

                // Calculate derived fields if averageCost is available
                if (holding.price) {
                  holding.marketValue = holding.numShares * marketData.price;
                  holding.unrealizedGainLoss = holding.marketValue - (holding.costBasis ?? 0);
                  holding.gainLoss = (holding.realizedGainLoss ?? 0) + holding.unrealizedGainLoss;
                  holding.gainLossPercent = (holding.costBasis ?? 0) > 0
                    ? (holding.gainLoss / (holding.costBasis ?? 0)) * 100
                    : undefined;
                }
              }

              // Apply asset data (company name, etc.)
              if (assetResponse && assetResponse.data) {
                holding.companyName = assetResponse.data.name;
              }
            });
            return of(holdings);
          })
        );
      }),
      catchError(error => {
        console.error('Error fetching holdings or market data:', {
          status: error?.status,
          statusText: error?.statusText,
          message: error?.message,
          url: error?.url,
          error: error?.error,
          fullError: error
        });
        this.errorMessage = 'Failed to load holdings or market data. Check console for details.';
        return of([]);
      })
    ).subscribe({
      next: (enrichedHoldings: Holding[]) => {
        this.holdings = enrichedHoldings;
        console.log('Holdings enriched with market data and company names:', this.holdings);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error in subscription:', error);
        this.errorMessage = 'Failed to load holdings.';
        this.holdings = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
