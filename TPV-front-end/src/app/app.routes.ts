import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { AnalyticsDashboard } from './analytics-dashboard/analytics-dashboard';

export const routes: Routes = [
	{
		path: '',
		component: HomePage
	},
	{
		path: 'analytics',
		component: AnalyticsDashboard
	}
];

