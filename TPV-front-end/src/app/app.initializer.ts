import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { catchError, of } from 'rxjs';

/**
 * App initializer that validates the user's session on app startup.
 * This runs before routes are loaded, ensuring the in-memory authentication state
 * is up-to-date after a browser refresh.
 * 
 * If the session is valid, authenticatedSession is set to true.
 * If the session is invalid or expired, it remains false.
 */
export function validateSessionOnStartup() {
  const authService = inject(AuthService);

  return authService.checkSession().pipe(
    catchError(() => {
      // Session validation failed, session remains unauthenticated
      return of(false);
    })
  );
}
