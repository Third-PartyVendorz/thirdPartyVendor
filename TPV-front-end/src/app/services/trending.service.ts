import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.local';
import { TrendingTickerResponse } from '../dto/TrendingTickerResponse';

@Injectable({
	providedIn: 'root',
})
export class TrendingService {
	constructor(private http: HttpClient) {}

	fetchTrendingTickers(from: Date, to: Date, k = 5): Observable<TrendingTickerResponse[]> {
		const params = new HttpParams()
			.set('from', from.toISOString())
			.set('to', to.toISOString())
			.set('k', k.toString());

		return this.http.get<TrendingTickerResponse[]>(`${environment.apiBaseUrl}/trending/tickers`, { params });
	}
}
