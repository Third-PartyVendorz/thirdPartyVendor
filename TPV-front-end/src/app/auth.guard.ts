import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ErrorService } from './services/error.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const errorService = inject(ErrorService);

  if (!authService.getAuthToken()) {
    errorService.setErrorMessage('You must be signed in to access that page.');
    return router.parseUrl('/login');
  }

  errorService.clearErrorMessage();
  return true;
};