import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioSummary } from '../portfolio-summary/portfolio-summary';
import { Navbar } from '../../navbar/navbar';
import { HoldingsTable } from '../holdings-table/holdings-table';
import { PortfolioGraphics } from '../portfolio-graphics/portfolio-graphics';
import { HoldingService } from '../../services/holding.service';
import { Holding } from '../holdings-table/holding.model';
import { MarketApiService } from '../../services/marketApi.service';
import { switchMap, from, forkJoin, concatMap, catchError, map, reduce, Observable } from 'rxjs';
import { of } from 'rxjs';
import { MarketCacheQuotesAPIResponse, Quote } from '../../dto/MarketCacheQuotesAPIResponse';
import { MarketSymbolAPIResponse } from '../../dto/MarketSymbolAPIResponse';
import { HoldingResponse } from '../../dto/HoldingResponse';

@Component({
  standalone: true,
  imports: [CommonModule, Navbar, PortfolioSummary, HoldingsTable, PortfolioGraphics],
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
        const tickers = [...new Set(holdings.map(holding => holding.ticker))];
        const tickerBatches: string[][] = [];

        for (let index = 0; index < tickers.length; index += 25) {
          tickerBatches.push(tickers.slice(index, index + 25));
        }

        const quoteResponses$ = from(tickerBatches).pipe(
          concatMap((tickerBatch: string[]) => this.marketApiService.fetchCacheQuotes(tickerBatch).pipe(
            catchError(error => {
              console.error('Error fetching cached quote batch:', error);
              return of({ data: { quotes: [] } } as MarketCacheQuotesAPIResponse);
            })
          )),
          map(response => response.data.quotes),
          reduce((allQuotes: Quote[], batchQuotes: Quote[]) => [...allQuotes, ...batchQuotes], [])
        );

        const assetRequests: Record<string, Observable<MarketSymbolAPIResponse | null>> = {};
        tickers.forEach(ticker => {
          assetRequests[ticker] = this.marketApiService.fetchAssetInfo(ticker).pipe(
            catchError(error => {
              console.error(`Error fetching company info for ${ticker}:`, error);
              return of(null as MarketSymbolAPIResponse | null);
            })
          );
        });

        return forkJoin({
          quotes: quoteResponses$,
          assets: forkJoin(assetRequests)
        }).pipe(
          map(({ quotes, assets }) => {
            const quotesByTicker = new Map(quotes.map(quote => [quote.symbol, quote.quote]));
            const companyNamesByTicker = new Map(
              Object.entries(assets)
                .filter((entry): entry is [string, MarketSymbolAPIResponse] => entry[1] !== null)
                .map(([ticker, response]) => [ticker, response.data.name])
            );

            holdings.forEach(holding => {
              const marketData = quotesByTicker.get(holding.ticker);
              holding.companyName = companyNamesByTicker.get(holding.ticker) ?? (holding.security || undefined);

              if (marketData) {
                holding.price = marketData.price;
                holding.change = marketData.change;
                holding.dailyChangePercent = marketData.changePercent;
                holding.marketValue = holding.numShares * marketData.price;
                holding.unrealizedGainLoss = holding.marketValue - (holding.costBasis ?? 0);
                holding.gainLoss = (holding.realizedGainLoss ?? 0) + holding.unrealizedGainLoss;
                holding.gainLossPercent = (holding.costBasis ?? 0) > 0
                  ? (holding.gainLoss / (holding.costBasis ?? 0)) * 100
                  : undefined;
              }
            });

            return holdings;
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
