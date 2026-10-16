import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { AuthPage } from './auth-page/auth-page';
import { authGuard, landingGuard } from './auth.guard';
import { DashboardPage } from './dashboard/dashboard-page/dashboard-page';
import { HistoryPage } from './history-page/history-page';
import { MainLayoutComponent } from './layouts/main-layout';
import { AssetsPage } from './assets-page/assets-page';
import { ProfilePage } from './profile-page/profile-page';
import { TradePage } from './trade-page/trade-page.component';
import { ManageCash } from './manage-cash/manage-cash/manage-cash';

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
      { path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
      { path: 'portfolio-history', component: HistoryPage, canActivate: [authGuard] },
      { path: 'trade', component: TradePage, canActivate: [authGuard] },
      { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
      { path: 'explore-assets', component: AssetsPage, canActivate: [authGuard] },
      { path: 'manage-cash', component: ManageCash, canActivate: [authGuard] },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
