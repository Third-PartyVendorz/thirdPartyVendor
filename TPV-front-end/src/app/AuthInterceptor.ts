import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export function authInterceptor(req: any, next: any) {
  const authToken = inject(AuthService).getAuthToken();
  if (authToken) {
    req = req.clone({
      headers: req.headers.append('Authorization', `Bearer ${authToken}`)
    })
  }
  return next(req);
}