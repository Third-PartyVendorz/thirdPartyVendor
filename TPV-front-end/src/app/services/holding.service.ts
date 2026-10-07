import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Holding } from '../dashboard/holdings-table/holding.model';
import { environment } from '../../environments/environment.local';
import { AuthService } from './auth.service';
import { MOCK_HOLDINGS } from '../dashboard/holdings-table/mock-holdings';

@Injectable({
  providedIn: 'root'
})
export class HoldingService {
    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    fetchHoldings(): Observable<Holding[]> {
        return of(MOCK_HOLDINGS);
    }

    private fetchHoldingsFromAPI(): Observable<Holding[]> {
        const token = this.authService.getAuthToken();
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        return this.http.get<Holding[]>(
            `${environment.apiBaseUrl}/holdings/}`,
            { headers }
        );
    }
}