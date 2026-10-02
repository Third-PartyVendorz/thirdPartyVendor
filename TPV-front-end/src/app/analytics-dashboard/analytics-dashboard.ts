import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common'

import { Navbar } from './../navbar/navbar';
import { AnalyticsResponse } from '../dto/AnalyticsResponse';

// Register Chart.js components

import { AnalyticsService } from '../services/analytics.service';

@Component({
  imports: [CommonModule, Navbar],
  selector: 'app-analytics-dashboard',
  styleUrl: './analytics-dashboard.scss',
  templateUrl: './analytics-dashboard.html',
})
export class AnalyticsDashboard {
  analyticsResult: AnalyticsResponse | null = null;
  objectKeys = Object.keys;

  constructor(private analyticsService: AnalyticsService) {}


  performAnalytics() {
    this.analyticsService.performAnalytics().subscribe({
      next: (response) => {
        console.log('response received:', response);
        this.analyticsResult = response;
      }
    });
  }

}
