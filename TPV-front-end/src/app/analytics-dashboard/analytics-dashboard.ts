import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Chart,
  ChartConfiguration,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
Chart.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { AnalyticsService } from '../services/analytics.service';

@Component({
  imports: [CommonModule],
  selector: 'app-analytics-dashboard',
  styleUrl: './analytics-dashboard.scss',
  templateUrl: './analytics-dashboard.html',
})
export class AnalyticsDashboard implements AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  analyticsResult: any;
  chart: Chart | null = null;

  constructor(private analyticsService: AnalyticsService) {}

  ngAfterViewInit() {
    // Initialize chart setup after view is initialized
  }

  performAnalytics() {
    this.analyticsService.performAnalytics().subscribe(response => {
      console.log(response);
      this.analyticsResult = response;
      this.createChart(response);
    });
  }

  private createChart(data: any) {
    if (!this.chartCanvas) {
      return;
    }

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (!ctx) {
        return;
      }

      const chartConfig: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels: ['Buy Orders', 'Sell Orders'],
          datasets: [
            {
              label: 'Buy Count',
              data: [data.buy_count, null],
              backgroundColor: 'rgba(76, 175, 80, 0.85)',
              borderColor: 'rgba(76, 175, 80, 1)',
              borderWidth: 2,
              borderRadius: 8,
              hoverBackgroundColor: 'rgba(76, 175, 80, 1)',
            },
            {
              label: 'Sell Count',
              data: [null, data.sell_count],
              backgroundColor: 'rgba(244, 67, 54, 0.85)',
              borderColor: 'rgba(244, 67, 54, 1)',
              borderWidth: 2,
              borderRadius: 8,
              hoverBackgroundColor: 'rgba(244, 67, 54, 1)',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                font: {
                  size: 14,
                  weight: 'bold',
                },
                padding: 15,
                color: '#333',
              },
            },
            title: {
              display: true,
              text: 'Buy vs Sell Orders Analysis',
              font: {
                size: 18,
                weight: 'bold',
              },
              color: '#333',
              padding: 20,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  size: 12,
                },
                color: '#666',
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
              },
            },
            x: {
              ticks: {
                font: {
                  size: 12,
                  weight: 500,
                },
                color: '#666',
              },
              grid: {
                display: false,
              },
            },
          },
        },
      };

      this.chart = new Chart(ctx, chartConfig);
    }, 0);
  }
}
