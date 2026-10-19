import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MessageService } from './services/message.service';
import { UserContextService } from './services/user-context.service';

/**
 * Auth guard that protects routes from unauthenticated access.
 * 
 * Workflow:
 * 1. On app startup: APP_INITIALIZER runs validateSessionOnStartup() which calls /me endpoint
 *    and updates the in-memory authenticatedSession variable
 * 2. On route navigation: This guard checks only the in-memory state (no API call)
 * 3. On browser refresh: App initializer re-validates the session
 * 
 * This balances security (fresh validation on refresh) with performance (no API calls on route changes)
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  // Check the in-memory session state (populated by APP_INITIALIZER on startup)
  if (authService.getSessionState() === true) {
    messageService.clearMessage();
    return true;
  }

  // Session not authenticated, redirect to login
  messageService.setErrorMessage('You must be signed in to access that page.');
  return router.parseUrl('/login');
};

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as string[] | undefined;
  const userRole = authService.getUserRole();

  if (allowedRoles?.includes(userRole ?? '')) {
    return true;
  }

  if (userRole === 'ADMIN') {
    return router.parseUrl('/admin');
  }
  if (userRole === 'ANALYST') {
    return router.parseUrl('/analyst/analytics');
  }
  return router.parseUrl('/dashboard');
};

export const landingGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const userContextService = inject(UserContextService);
  const router = inject(Router);
  const role = authService.getUserRole();

  if (authService.getSessionState() !== true) {
    return router.parseUrl('/login');
  }

  if (role === 'ADMIN') {
    return router.parseUrl('/admin');
  }
  if (role === 'ANALYST') {
    return router.parseUrl('/analyst/analytics');
  }
  return router.parseUrl('/dashboard');
};