import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { AuthPage } from './auth-page/auth-page';
import { adminGuard, landingGuard, userGuard } from './auth.guard';
import { DashboardPage } from './dashboard/dashboard-page/dashboard-page';
import { HistoryPage } from './history-page/history-page';
import { MainLayoutComponent } from './layouts/main-layout';
import { AssetsPage } from './assets-page/assets-page';
import { ProfilePage } from './profile-page/profile-page';
import { TradePage } from './trade-page/trade-page.component';
import { AdminLayoutComponent } from './layouts/admin-layout';
import { AdminUsersPage } from './admin/users-page/admin-users-page';

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
      { path: 'dashboard', component: DashboardPage, canActivate: [userGuard] },
      { path: 'portfolio-history', component: HistoryPage, canActivate: [userGuard] },
      { path: 'trade', component: TradePage, canActivate: [userGuard] },
      { path: 'profile', component: ProfilePage, canActivate: [userGuard] },
      { path: 'explore-assets', component: AssetsPage, canActivate: [userGuard] },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: 'users', component: AdminUsersPage },
      { path: '', pathMatch: 'full', redirectTo: 'users' },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
