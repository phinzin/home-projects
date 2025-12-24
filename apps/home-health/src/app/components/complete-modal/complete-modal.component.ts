import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/maintenance-tracker.model';

@Component({
  selector: 'app-complete-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen && task) {
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
            <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <span class="text-3xl">✓</span>
            </div>
          </div>

          <!-- Title -->
          <h3 class="text-xl font-bold text-gray-900 text-center mb-2">
            Hoàn thành công việc
          </h3>

          <!-- Task Name -->
          <p class="text-indigo-600 font-semibold text-center mb-4">
            {{ task.taskName }}
          </p>

          <!-- Form -->
          <div class="space-y-4 mb-6">
            @if (task.periodType === 'mileage') {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Số KM hiện tại (ODO)
                </label>
                <input
                  type="number"
                  [(ngModel)]="odoValue"
                  [placeholder]="'Ví dụ: ' + (task.lastCompletedValue || 0 + task.periodValue)"
                  class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  min="0"
                />
              </div>
            }

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                [(ngModel)]="notes"
                placeholder="Thêm ghi chú về lần bảo trì này..."
                rows="2"
                class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              (click)="onCancel()"
              class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              (click)="onConfirm()"
              [disabled]="task.periodType === 'mileage' && !odoValue"
              class="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác nhận
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
export class CompleteModalComponent {
  @Input() isOpen = false;
  @Input() task: Task | null = null;

  @Output() confirm = new EventEmitter<{ value?: number; notes?: string }>();
  @Output() cancel = new EventEmitter<void>();

  odoValue: number | null = null;
  notes = '';

  onConfirm(): void {
    this.confirm.emit({
      value: this.odoValue ?? undefined,
      notes: this.notes || undefined
    });
    this.reset();
  }

  onCancel(): void {
    this.cancel.emit();
    this.reset();
  }

  private reset(): void {
    this.odoValue = null;
    this.notes = '';
  }
}
