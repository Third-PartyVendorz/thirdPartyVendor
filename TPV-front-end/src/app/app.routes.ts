import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { AuthPage } from './auth-page/auth-page';
import { authGuard } from './auth.guard';
import { DashboardPage } from './dashboard/dashboard-page/dashboard-page';
import { AssetPage } from './asset-page/asset-page';

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
		path: 'assets/:ticker',
		component: AssetPage,
		canActivate: [authGuard],
	},
	{
		path: '**',
		redirectTo: '',
	},
];
