import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { LoadingService } from '@core/services/loading.service';
import { TokenService } from '@core/services/token.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const errorHandler = inject(ErrorHandlerService);
  const loading = inject(LoadingService);
  const tokenService = inject(TokenService);

  loading.show();
  return next(req).pipe(
    finalize(() => loading.hide()),
    catchError((err: HttpErrorResponse) => {
      const message =
        err.error?.message ?? err.message ?? 'An unexpected error occurred';

      if (err.status === 401) {
        tokenService.removeTokens();
        router.navigate(['/auth/login']);
        errorHandler.showError('Session expired. Please sign in again.');
        return throwError(() => err);
      }

      if (err.status >= 500) {
        errorHandler.showError('Server error. Please try again later.');
      } else if (err.status >= 400) {
        errorHandler.showError(message);
      }

      return throwError(() => err);
    })
  );
};
