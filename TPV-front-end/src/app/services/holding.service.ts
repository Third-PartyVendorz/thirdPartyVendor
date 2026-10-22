import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HoldingResponse } from '../dto/HoldingResponse';
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

    fetchHoldingsFromAPI(): Observable<HoldingResponse[]> {
        return this.http.get<HoldingResponse[]>(
            `${environment.apiBaseUrl}/holdings`,
        );
    }
}