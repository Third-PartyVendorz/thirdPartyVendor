import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './services/auth.service';
import { ErrorService } from './services/error.service';

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): import('rxjs').Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const errorService = inject(ErrorService);
  const router = inject(Router);
  const authToken = authService.getAuthToken();
  const isAuthEndpoint = req.url.includes('/auth/authenticate') || req.url.includes('/auth/register');
  const shouldAttachAuthHeader = Boolean(authToken) && !isAuthEndpoint;
  const interceptedRequest = shouldAttachAuthHeader
    ? req.clone({
        headers: req.headers.append('Authorization', `Bearer ${authToken}`),
      })
    : req;

  return next(interceptedRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && shouldAttachAuthHeader) {
        if (error.status === 401) {
          authService.clearAuthToken();
          router.navigateByUrl('/login');
          errorService.setErrorMessage('Your session has expired. Please log in again.');
        }

        if (error.status === 403) {
          errorService.setErrorMessage('You do not have permission to access this resource.');
        }
      }

      return throwError(() => error);
    }),
  );
}