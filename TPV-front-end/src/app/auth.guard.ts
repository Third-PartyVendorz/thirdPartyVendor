import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MessageService } from './services/message.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  if (!authService.getAuthToken()) {
    messageService.setErrorMessage('You must be signed in to access that page.');
    return router.parseUrl('/login');
  }

  messageService.clearMessage();
  return true;
};