import { Component } from '@angular/core';
import { PortfolioSummary } from '../portfolio-summary/portfolio-summary';
import { HoldingsTable } from '../holdings-table/holdings-table';

@Component({
  imports: [PortfolioSummary, HoldingsTable],
  selector: 'app-dashboard-page',
  styleUrl: './dashboard-page.scss',
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {}
