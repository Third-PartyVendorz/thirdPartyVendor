import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { AuthPage } from './auth-page/auth-page';
import { authGuard, landingGuard, roleGuard } from './auth.guard';
import { DashboardPage } from './dashboard/dashboard-page/dashboard-page';
import { HistoryPage } from './history-page/history-page';
import { MainLayoutComponent } from './layouts/main-layout';
import { AssetsPage } from './assets-page/assets-page';
import { ProfilePage } from './profile-page/profile-page';
import { AnalyticsDashboard } from './analytics-dashboard/analytics-dashboard';
import { TradePage } from './trade-page/trade-page.component';
import { AdminDashboardPage } from './admin-dashboard-page/admin-dashboard-page';
import { AnalystLayoutComponent } from './layouts/analyst-layout';
import { AdminDashboardPage } from './admin/admin-dashboard-page/admin-dashboard-page';
import { AdminUsersPage } from './admin/users-page/admin-users-page';
import { AuditLogsPage } from './admin/audit-logs-page/audit-logs-page';

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
      { path: 'analytics', component: AnalyticsDashboard, canActivate: [authGuard, roleGuard], data: { roles: ['ANALYST'] } },
      { path: 'admin/users', component: AdminUsersPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
      { path: 'admin/audit', component: AuditLogsPage, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
      { path: 'analytics', component: AnalyticsDashboard, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
      { path: 'dashboard', component: DashboardPage, canActivate: [authGuard, roleGuard], data: { roles: ['USER'] } },
      { path: 'portfolio-history', component: HistoryPage, canActivate: [authGuard, roleGuard], data: { roles: ['USER'] } },
      { path: 'trade', component: TradePage, canActivate: [authGuard, roleGuard], data: { roles: ['USER'] } },
      { path: 'profile', component: ProfilePage, canActivate: [authGuard, roleGuard], data: { roles: ['USER'] } },
      { path: 'explore-assets', component: AssetsPage, canActivate: [authGuard, roleGuard], data: { roles: ['USER'] } },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];

