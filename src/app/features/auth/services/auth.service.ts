import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '@env/environment';
import { TokenService } from '@core/services/token.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { AuthStore } from '../store/auth.store';
import type { LoginRequest, RegisterRequest, AuthTokens } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly authStore = inject(AuthStore);

  private readonly baseUrl = `${environment.apiUrl}/auth`;

  login(credentials: LoginRequest) {
    return this.http.post<AuthTokens>(`${this.baseUrl}/login`, credentials).pipe(
      tap((res) => {
        this.tokenService.setTokens(res.accessToken, res.refreshToken);
        this.authStore.setUser(res.user);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  register(data: RegisterRequest) {
    return this.http.post<AuthTokens>(`${this.baseUrl}/register`, data).pipe(
      tap((res) => {
        this.tokenService.setTokens(res.accessToken, res.refreshToken);
        this.authStore.setUser(res.user);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  logout(): void {
    this.tokenService.removeTokens();
    this.authStore.logout();
    this.router.navigate(['/auth/login']);
  }

  loadUser(): void {
    const token = this.tokenService.getToken();
    if (!token) {
      this.authStore.setInitialized();
      return;
    }
    this.http.get<AuthTokens['user']>(`${this.baseUrl}/me`).subscribe({
      next: (user) => this.authStore.setUser(user),
      error: () => {
        this.tokenService.removeTokens();
        this.authStore.setInitialized();
      },
    });
  }
}
