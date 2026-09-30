import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnalyticsService } from '../services/analytics.service';

@Component({
  imports: [CommonModule],
  selector: 'app-analytics-dashboard',
  styleUrl: './analytics-dashboard.scss',
  templateUrl: './analytics-dashboard.html',
})
export class AnalyticsDashboard {
  analyticsResult: any;

  constructor(private analyticsService: AnalyticsService) {}

  performAnalytics() {
    this.analyticsService.performAnalytics().subscribe(response => {
      console.log(response);
      this.analyticsResult = response;
    });
  }
}
