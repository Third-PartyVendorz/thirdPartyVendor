import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AnalyticsResponse } from '../dto/AnalyticsResponse';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private http: HttpClient) { }

  performAnalytics() {
    return this.http.get<AnalyticsResponse>(`${environment.analyticsBaseUrl}/analytics`);
  }

}