import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'timeout';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSignal = signal<Toast[]>([]);
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly toasts = this.toastsSignal.asReadonly();
  readonly hasToasts = computed(() => this.toastsSignal().length > 0);

  private nextId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  show(type: ToastType, message: string, options?: { title?: string; duration?: number }): string {
    const id = this.nextId();
    const duration = options?.duration ?? (type === 'error' || type === 'timeout' ? 6000 : 4000);
    const toast: Toast = {
      id,
      type,
      message,
      title: options?.title,
      duration,
      createdAt: Date.now()
    };
    this.toastsSignal.update((list) => [...list, toast]);
    if (duration > 0) {
      const t = setTimeout(() => this.dismiss(id), duration);
      this.timers.set(id, t);
    }
    return id;
  }

  success(message: string, title?: string): string {
    return this.show('success', message, { title, duration: 4000 });
  }

  error(message: string, title = 'Error'): string {
    return this.show('error', message, { title, duration: 6000 });
  }

  timeout(message: string, title = 'Timeout'): string {
    return this.show('timeout', message, { title, duration: 6000 });
  }

  dismiss(id: string): void {
    const t = this.timers.get(id);
    if (t) {
      clearTimeout(t);
      this.timers.delete(id);
    }
    this.toastsSignal.update((list) => list.filter((toast) => toast.id !== id));
  }

  dismissAll(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
    this.toastsSignal.set([]);
  }
}
