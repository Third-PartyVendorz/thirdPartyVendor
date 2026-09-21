import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export function authInterceptor(req: any) {
  const authToken = inject(AuthService).getAuthToken();
  if (authToken) {
    req.headers = {
      ...req.headers,
      Authorization: `Bearer ${authToken}`
    };
  }
  return req;
}