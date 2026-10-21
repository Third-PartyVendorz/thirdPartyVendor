import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.local';

export interface AddWatchlistRequest {
  ticker: string;
}

export interface RemoveWatchlistRequest {
  tickers: string[];
}

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private readonly watchlistUrl = `${environment.apiBaseUrl}/watchlist`;

  constructor(private readonly http: HttpClient) {}

  getWatchlist(): Observable<string[]> {
    return this.http.get<string[]>(this.watchlistUrl);
  }

  addToWatchlist(ticker: string): Observable<string[]> {
    const request: AddWatchlistRequest = { ticker };
    return this.http.post<string[]>(this.watchlistUrl, request);
  }

  removeFromWatchlist(tickers: string[]): Observable<string[]> {
    const request: RemoveWatchlistRequest = { tickers };
    return this.http.delete<string[]>(this.watchlistUrl, { body: request });
  }
}