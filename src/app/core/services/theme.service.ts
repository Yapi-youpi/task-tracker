import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'task_tracker_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly darkSignal = signal<boolean>(this.loadInitial());

  readonly isDark = computed(() => this.darkSignal());

  private loadInitial(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  toggle(): void {
    this.darkSignal.update((v) => {
      const next = !v;
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  }

  setDark(value: boolean): void {
    this.darkSignal.set(value);
    localStorage.setItem(STORAGE_KEY, value ? 'dark' : 'light');
  }
}
