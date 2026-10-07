import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MessageService } from './services/message.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  const redirectToLogin = () => {
    authService.markSessionExpired();
    messageService.setErrorMessage('You must be signed in to access that page.');
    return router.parseUrl('/login');
  };

  if (authService.getSessionState() === true) {
    messageService.clearMessage();
    return true;
  }

  if (authService.getSessionState() === false) {
    return redirectToLogin();
  }

  return authService.checkSession().pipe(
    map((isAuthenticated) => {
      if (isAuthenticated) {
        messageService.clearMessage();
        return true;
      }

      return redirectToLogin();
    }),
  );
};