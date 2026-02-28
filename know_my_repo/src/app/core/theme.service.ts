import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'know-my-repo-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeSignal = signal<Theme>(this.loadStored());
  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  toggle(): void {
    const next: Theme = this.themeSignal() === 'dark' ? 'light' : 'dark';
    this.themeSignal.set(next);
    this.apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    this.apply(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }

  private loadStored(): Theme {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s === 'light' || s === 'dark') return s;
    } catch {}
    return 'dark';
  }

  private apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  /** Call once on app init to apply stored theme. */
  init(): void {
    this.apply(this.themeSignal());
  }
}
