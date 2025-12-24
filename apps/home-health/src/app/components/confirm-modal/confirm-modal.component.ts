import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          (click)="onCancel()"
        ></div>

        <!-- Modal -->
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
          <!-- Icon -->
          <div class="flex justify-center mb-4">
            <div [class]="getIconBgClass()" class="w-16 h-16 rounded-full flex items-center justify-center">
              <span class="text-3xl">{{ getIcon() }}</span>
            </div>
          </div>

          <!-- Title -->
          <h3 class="text-xl font-bold text-gray-900 text-center mb-2">
            {{ title }}
          </h3>

          <!-- Message -->
          <p class="text-gray-600 text-center mb-6">
            {{ message }}
          </p>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              (click)="onCancel()"
              class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              (click)="onConfirm()"
              [class]="getConfirmButtonClass()"
              class="flex-1 px-4 py-3 font-semibold rounded-xl transition-colors"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }

    .animate-scale-in {
      animation: scaleIn 0.2s ease-out;
    }
  `]
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Xác nhận';
  @Input() message = 'Bạn có chắc chắn muốn thực hiện hành động này?';
  @Input() confirmText = 'Xác nhận';
  @Input() cancelText = 'Hủy';
  @Input() type: 'danger' | 'warning' | 'success' | 'info' = 'danger';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  getIcon(): string {
    const icons: Record<string, string> = {
      danger: '🗑️',
      warning: '⚠️',
      success: '✓',
      info: 'ℹ️'
    };
    return icons[this.type] || '❓';
  }

  getIconBgClass(): string {
    const classes: Record<string, string> = {
      danger: 'bg-red-100',
      warning: 'bg-yellow-100',
      success: 'bg-green-100',
      info: 'bg-blue-100'
    };
    return classes[this.type] || 'bg-gray-100';
  }

  getConfirmButtonClass(): string {
    const classes: Record<string, string> = {
      danger: 'bg-red-600 text-white hover:bg-red-700',
      warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
      success: 'bg-green-600 text-white hover:bg-green-700',
      info: 'bg-blue-600 text-white hover:bg-blue-700'
    };
    return classes[this.type] || 'bg-gray-600 text-white hover:bg-gray-700';
  }
}
