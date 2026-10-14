import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MarketQuoteAPIResponse } from '../dto/MarketQuoteAPIResponse';
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
}