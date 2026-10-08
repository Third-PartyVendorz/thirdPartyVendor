import { inject } from '@angular/core';
import {
  HttpErrorResponse,
	HttpContextToken,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../environments/environment.local';
import { AuthService } from './services/auth.service';
import { MessageService } from './services/message.service';

const refreshRetryAttempted = new HttpContextToken<boolean>(() => false);

export function authInterceptor(
	req: HttpRequest<unknown>,
	next: HttpHandlerFn,
): import('rxjs').Observable<HttpEvent<unknown>> {
	const authService = inject(AuthService);
	const messageService = inject(MessageService);
	const router = inject(Router);
	const shouldUseCredentials = req.url.startsWith(environment.apiBaseUrl);
	const isAuthEndpoint = req.url.includes('/auth/register') || req.url.includes('/auth/authenticate') || req.url.includes('/auth/me') || req.url.includes('/auth/refresh');
	const interceptedRequest = shouldUseCredentials
		? req.clone({ withCredentials: true })
		: req;

	return next(interceptedRequest).pipe(
		catchError((error: unknown) => {
			if (error instanceof HttpErrorResponse && shouldUseCredentials && !isAuthEndpoint) {
				if (error.status === 401) {
					if (interceptedRequest.context.get(refreshRetryAttempted)) {
						authService.markSessionExpired();
						router.navigateByUrl('/login');
						messageService.setErrorMessage('Your session has expired. Please log in again.');
						return throwError(() => error);
					}

					const retriedRequest = interceptedRequest.clone({
						context: interceptedRequest.context.set(refreshRetryAttempted, true),
					});

					return authService.refreshToken().pipe(
						switchMap(() => next(retriedRequest)),
						catchError((refreshError: unknown) => {
						authService.markSessionExpired();
						router.navigateByUrl('/login');
						messageService.setErrorMessage('Your session has expired. Please log in again.');
							return throwError(() => refreshError);
						}),
					);
				}

				if (error.status === 403) {
					messageService.setErrorMessage('You do not have permission to access this resource.');
				}
			}

			return throwError(() => error);
		}),
	);
}



