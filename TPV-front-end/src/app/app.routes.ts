import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { AuthPage } from './auth-page/auth-page';
import { authGuard, landingGuard, roleGuard } from './auth.guard';
import { DashboardPage } from './dashboard/dashboard-page/dashboard-page';
import { HistoryPage } from './history-page/history-page';
import { MainLayoutComponent } from './layouts/main-layout';
import { AssetsPage } from './assets-page/assets-page';
import { ProfilePage } from './profile-page/profile-page';
import { TradePage } from './trade-page/trade-page.component';
import { ForexContainer } from './manage-cash/forex-container/forex-container';
import { AdminDashboardPage } from './admin-dashboard-page/admin-dashboard-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: MainLayoutComponent,
    canActivate: [landingGuard],
  },
  {
    path: 'login',
    component: AuthPage,
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'admin', component: AdminDashboardPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
      { path: 'dashboard', component: DashboardPage, canActivate: [authGuard, roleGuard], data: { roles: ['USER'] } },
      { path: 'portfolio-history', component: HistoryPage, canActivate: [authGuard, roleGuard], data: { roles: ['USER'] } },
      { path: 'trade', component: TradePage, canActivate: [authGuard, roleGuard], data: { roles: ['USER'] } },
      { path: 'exchange-currency', component: ForexContainer, canActivate: [authGuard, roleGuard], data: { roles: ['USER'] } },
      { path: 'profile', component: ProfilePage, canActivate: [authGuard, roleGuard], data: { roles: ['USER'] } },
      { path: 'explore-assets', component: AssetsPage, canActivate: [authGuard, roleGuard], data: { roles: ['USER'] } },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
