import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MessageService } from './services/message.service';
import { catchError, map, of, switchMap } from 'rxjs';

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

  return authService.checkSession().pipe(
    switchMap((isAuthenticated) => {
      if (isAuthenticated) {
        messageService.clearMessage();
        return of(true);
      }

      return authService.refreshToken().pipe(
        map(() => {
          messageService.clearMessage();
          return true;
        }),
        catchError(() => of(redirectToLogin())),
      );
    }),
  );
};