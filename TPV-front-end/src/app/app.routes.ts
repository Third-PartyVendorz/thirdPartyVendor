import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { AuthPage } from './auth-page/auth-page';
import { authGuard } from './auth.guard';
import { DashboardPage } from './dashboard/dashboard-page/dashboard-page';
import { AnalyticsDashboard } from './analytics-dashboard/analytics-dashboard';

export const routes: Routes = [
	{
		path: 'login',
		component: AuthPage,
	},
	{
		path: 'dashboard',
		component: DashboardPage,
		canActivate: [authGuard],
	},
	{
		path: '',
		component: HomePage,
		pathMatch: 'full',
		canActivate: [authGuard],
	},
	{
		path: '**',
		redirectTo: '',
		component: HomePage
	},
	{
		path: 'analytics',
		component: AnalyticsDashboard
	}
];

