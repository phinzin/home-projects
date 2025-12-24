import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  readonly activeToasts = this.toasts.asReadonly();

  private defaultDuration = 3000;

  show(message: string, type: Toast['type'] = 'info', duration?: number): void {
    const toast: Toast = {
      id: this.generateId(),
      message,
      type,
      duration: duration ?? this.defaultDuration
    };

    this.toasts.update(toasts => [...toasts, toast]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => this.dismiss(toast.id), toast.duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration ?? 5000);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  dismiss(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  dismissAll(): void {
    this.toasts.set([]);
  }

  private generateId(): string {
    return `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
