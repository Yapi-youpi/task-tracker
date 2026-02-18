import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '@core/services/token.service';
import { environment } from '@env/environment';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();
  if (!token) return next(req);

  const apiUrl = environment.apiUrl;
  const isApiRequest = req.url.startsWith(apiUrl) || req.url.startsWith('/api');
  if (!isApiRequest) return next(req);

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(cloned);
};
