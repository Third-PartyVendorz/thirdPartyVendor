import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { AuthPage } from './auth-page/auth-page';
import { authGuard } from './auth.guard';

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
		path: '**',
		redirectTo: '',
	},
];
