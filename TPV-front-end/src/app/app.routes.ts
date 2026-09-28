import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { LoginContainer } from './login-container/login-container';
import { authGuard } from './auth.guard';

export const routes: Routes = [
	{
		path: 'login',
		component: LoginContainer,
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
