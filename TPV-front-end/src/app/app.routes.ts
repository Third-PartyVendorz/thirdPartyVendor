import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { DashboardPage } from './dashboard/dashboard-page/dashboard-page';
import { HistoryPage } from './history-page/history-page';
import { TradePage } from './trade-page/trade-page';
import { MainLayoutComponent } from './layouts/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    children: [
      { path: '', component: DashboardPage },
    ],
  },
  {
    path: 'history',
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
    path: 'login',
    redirectTo: '',
  },
  { path: '**', redirectTo: '' },
];
