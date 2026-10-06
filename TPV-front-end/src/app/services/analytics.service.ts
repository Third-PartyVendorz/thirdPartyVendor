import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AnalyticsResponse } from '../dto/AnalyticsResponse';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private http: HttpClient) { }

  performAnalytics(options?: { startDate?: string; endDate?: string }) {
    const params: any = {};
    if (options?.startDate) {
      params.startDate = options.startDate;
    }
    if (options?.endDate) {
      params.endDate = options.endDate;
    }
    return this.http.get<AnalyticsResponse>(`${environment.analyticsBaseUrl}/analytics`, { params });
  }

}