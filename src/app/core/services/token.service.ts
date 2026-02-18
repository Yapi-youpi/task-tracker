import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class TokenService {
  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(environment.refreshTokenKey);
  }

  setTokens(access: string, refresh?: string): void {
    localStorage.setItem(environment.tokenKey, access);
    if (refresh) {
      localStorage.setItem(environment.refreshTokenKey, refresh);
    }
  }

  removeTokens(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}
