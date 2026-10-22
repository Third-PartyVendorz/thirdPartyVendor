import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MarketQuoteAPIResponse, MarketQuoteBatchAPIResponse } from '../dto/MarketQuoteAPIResponse';
import { MarketSymbolAPIResponse } from '../dto/MarketSymbolAPIResponse';
import { MarketHistoricalAPIResponse } from '../dto/MarketHistoricalAPIResponse';

import { environment } from '../../environments/environment.local';



@Injectable({
  providedIn: 'root'
})
export class MarketApiService {
  constructor(private http: HttpClient) {}

  private FAUXNANCE_API_URL = environment.fauxnanceApiUrl;
  private FAUXNANCE_API_KEY = environment.fauxnanceApiKey;

  fetchQuote(ticker: string): Observable<MarketQuoteAPIResponse> {
    return this.http.get<MarketQuoteAPIResponse>(`${this.FAUXNANCE_API_URL}/quotes/${ticker}`, {
      headers: {
        'X-Api-Key': this.FAUXNANCE_API_KEY
      }
    });
  }

  fetchQuotes(tickers: string[]): Observable<MarketQuoteBatchAPIResponse> {
    const symbols = [...new Set(tickers.map((ticker) => ticker.trim().toUpperCase()).filter(Boolean))].slice(0, 25);
    const params = new HttpParams().set('symbols', symbols.join(','));

    return this.http.get<MarketQuoteBatchAPIResponse>(`${this.FAUXNANCE_API_URL}/quotes`, {
      headers: {
        'X-Api-Key': this.FAUXNANCE_API_KEY
      },
      params,
    });
  }

  fetchForexQuote(fromCurrency: string, toCurrency: string): Observable<MarketQuoteAPIResponse> {
    return this.fetchQuote(`FX:${fromCurrency}${toCurrency}`);
  }

  fetchAssetInfo(ticker: string): Observable<MarketSymbolAPIResponse> {
    return this.http.get<MarketSymbolAPIResponse>(`${this.FAUXNANCE_API_URL}/symbols/${ticker}`, {
      headers: {
        'X-Api-Key': this.FAUXNANCE_API_KEY
      }
    });
  }

  fetchHistoricalCandles(ticker: string, from: string, to: string): Observable<MarketHistoricalAPIResponse> {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('interval', '1d');

    return this.http.get<MarketHistoricalAPIResponse>(`${this.FAUXNANCE_API_URL}/candles/${ticker}`, {
      headers: {
        'X-Api-Key': this.FAUXNANCE_API_KEY
      },
      params,
    });
  }

  fetchForexHistoricalCandles(fromCurrency: string, toCurrency: string, from: string, to: string): Observable<MarketHistoricalAPIResponse> {
    return this.fetchHistoricalCandles(`FX:${fromCurrency}${toCurrency}`, from, to);
  }
}