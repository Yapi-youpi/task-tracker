import { Injectable, signal, computed } from '@angular/core';
import type { AuthUser } from '../models/auth.model';

export interface AuthState {
  user: AuthUser | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  initialized: false,
};

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly state = signal<AuthState>(initialState);

  readonly user = computed(() => this.state().user);
  readonly isAuthenticated = computed(() => !!this.state().user);
  readonly initialized = computed(() => this.state().initialized);

  setUser(user: AuthUser | null): void {
    this.state.update((s) => ({ ...s, user, initialized: true }));
  }

  setInitialized(): void {
    this.state.update((s) => ({ ...s, initialized: true }));
  }

  logout(): void {
    this.state.set(initialState);
  }
}
