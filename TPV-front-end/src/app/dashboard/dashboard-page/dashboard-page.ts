import { Component } from '@angular/core';
import { Navbar } from '../../navbar/navbar';
import { PortfolioSummary } from '../portfolio-summary/portfolio-summary';
import { HoldingsTable } from '../holdings-table/holdings-table';
import { PortfolioGraphics } from '../portfolio-graphics/portfolio-graphics';

@Component({
  standalone: true,
  imports: [Navbar, PortfolioSummary, HoldingsTable, PortfolioGraphics],
  selector: 'app-dashboard-page',
  styleUrl: './dashboard-page.scss',
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {}
