import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      @for (toast of toastService.activeToasts(); track toast.id) {
        <div
          class="toast-item flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 animate-slide-in"
          [class]="getToastClasses(toast.type)"
          role="alert"
        >
          <span class="text-xl">{{ getIcon(toast.type) }}</span>
          <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
          <button
            (click)="toastService.dismiss(toast.id)"
            class="p-1 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Đóng"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-item {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      background-color: #ecfdf5;
      border-color: #10b981;
      color: #065f46;
    }

    .toast-error {
      background-color: #fef2f2;
      border-color: #ef4444;
      color: #991b1b;
    }

    .toast-warning {
      background-color: #fffbeb;
      border-color: #f59e0b;
      color: #92400e;
    }

    .toast-info {
      background-color: #eff6ff;
      border-color: #3b82f6;
      color: #1e40af;
    }
  `]
})
export class ToastComponent {
  protected toastService = inject(ToastService);

  getToastClasses(type: string): string {
    return `toast-${type}`;
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || 'ℹ';
  }
}
