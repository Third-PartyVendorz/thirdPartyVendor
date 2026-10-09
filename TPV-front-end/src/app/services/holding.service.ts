import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Holding } from '../dashboard/holdings-table/holding.model';
import { environment } from '../../environments/environment.local';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HoldingService {
    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    fetchHoldingsFromAPI(): Observable<Holding[]> {
        return this.http.get<Holding[]>(
            `${environment.apiBaseUrl}/holdings`,
        );
    }
}