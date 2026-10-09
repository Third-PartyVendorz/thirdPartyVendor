import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { AuthPage } from './auth-page/auth-page';
import { authGuard } from './auth.guard';
import { DashboardPage } from './dashboard/dashboard-page/dashboard-page';
import { HistoryPage } from './history-page/history-page';
import { TradePage } from './trade-page/trade-page';
import { MainLayoutComponent } from './layouts/main-layout';
import { AssetsPage } from './assets-page/assets-page';
import { ProfilePage } from './profile-page/profile-page';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthPage,
  },
  {
    path: '',
    component: HomePage,
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
      { path: 'portfolio-history', component: HistoryPage, canActivate: [authGuard] },
      { path: 'trade', component: TradePage, canActivate: [authGuard] },
      { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
      { path: 'explore-assets', component: AssetsPage, canActivate: [authGuard] },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
