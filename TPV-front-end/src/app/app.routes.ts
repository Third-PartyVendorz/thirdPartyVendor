import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { AuthPage } from './auth-page/auth-page';
import { authGuard } from './auth.guard';
import { DashboardPage } from './dashboard/dashboard-page/dashboard-page';
import { HistoryPage } from './history-page/history-page';
import { TradePage } from './trade-page/trade-page';
import { MainLayoutComponent } from './layouts/main-layout';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthPage,
  },
  {
    path: '',
    component: HomePage,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    children: [
      { path: '', component: DashboardPage },
    ],
  },
  {
    path: 'portfolio-history',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HistoryPage },
    ],
  },
  {
    path: 'trade',
    component: MainLayoutComponent,
    children: [
      { path: '', component: TradePage },
    ],
  },
  {
		path: 'explore-assets',
		component: AssetsPage,
		canActivate: [authGuard],
	},
  {
    path: '**',
    redirectTo: '',
  },
];
