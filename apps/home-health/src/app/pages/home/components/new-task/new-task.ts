import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskCategory, CATEGORY_CONFIG } from '../../../../models/maintenance-tracker.model';
import { TaskService } from '../../../../services/task.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-new-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-task.html',
  styleUrl: './new-task.scss',
})
export class NewTask {
  private taskService = inject(TaskService);
  private toastService = inject(ToastService);

  // Form state
  taskName = '';
  periodType: 'time' | 'mileage' = 'time';
  periodValue: number | null = null;
  periodUnit: 'months' | 'days' | 'km' = 'months';
  category: TaskCategory = 'other';
  notes = '';

  // UI state
  isMileageType = signal(false);
  isFormExpanded = signal(false);
  isEditing = signal(false);
  editingTaskId = signal<string | null>(null);

  // Category options
  categories = Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
    value: key as TaskCategory,
    ...config
  }));

  constructor() {
    // Watch for editing task changes
    effect(() => {
      const editingTask = this.taskService.editingTaskData();
      if (editingTask) {
        this.populateForm(editingTask);
        this.isEditing.set(true);
        this.isFormExpanded.set(true);
        this.editingTaskId.set(editingTask.id);
      }
    }, { allowSignalWrites: true });
  }

  private populateForm(task: Task): void {
    this.taskName = task.taskName;
    this.periodType = task.periodType;
    this.periodValue = task.periodValue;
    this.periodUnit = task.periodUnit;
    this.category = task.category;
    this.notes = task.notes || '';
    this.isMileageType.set(task.periodType === 'mileage');
  }

  updatePeriodUnit(type: string): void {
    this.periodType = type as 'time' | 'mileage';
    this.isMileageType.set(type === 'mileage');
    if (type === 'mileage') {
      this.periodUnit = 'km';
    } else {
      this.periodUnit = 'months';
    }
  }

  toggleFormExpand(): void {
    if (this.isEditing()) {
      this.cancelEdit();
    } else {
      this.isFormExpanded.update(v => !v);
    }
  }

  cancelEdit(): void {
    this.resetForm();
    this.taskService.clearEditingTask();
    this.isEditing.set(false);
    this.editingTaskId.set(null);
    this.isFormExpanded.set(false);
  }

  submitTask(event: Event): void {
    event.preventDefault();

    if (!this.taskName.trim() || !this.periodValue || this.periodValue <= 0) {
      this.toastService.error('Vui lòng điền đầy đủ thông tin hợp lệ');
      return;
    }

    const now = Date.now();

    if (this.isEditing() && this.editingTaskId()) {
      // Update existing task
      const success = this.taskService.updateTask(this.editingTaskId()!, {
        taskName: this.taskName.trim(),
        periodType: this.periodType,
        periodValue: this.periodValue,
        periodUnit: this.periodUnit,
        category: this.category,
        notes: this.notes.trim() || undefined
      });

      if (success) {
        this.toastService.success('Đã cập nhật công việc thành công!');
        this.cancelEdit();
      } else {
        this.toastService.error('Không thể cập nhật công việc');
      }
    } else {
      // Add new task
      const taskData: Omit<Task, 'id' | 'timestamp' | 'history'> = {
        taskName: this.taskName.trim(),
        periodType: this.periodType,
        periodValue: this.periodValue,
        periodUnit: this.periodUnit,
        category: this.category,
        notes: this.notes.trim() || undefined,
        lastCompletedDate: this.periodType === 'time' ? now : null,
        lastCompletedValue: this.periodType === 'mileage' ? 0 : null
      };

      this.taskService.addTask(taskData);
      this.toastService.success('Đã thêm công việc mới!');

      if (this.periodType === 'mileage') {
        this.toastService.info('Nhớ cập nhật số KM hiện tại để tính toán chính xác!', 5000);
      }

      this.resetForm();
      this.isFormExpanded.set(false);
    }
  }

  private resetForm(): void {
    this.taskName = '';
    this.periodType = 'time';
    this.periodValue = null;
    this.periodUnit = 'months';
    this.category = 'other';
    this.notes = '';
    this.isMileageType.set(false);
  }

  getCategoryIcon(cat: TaskCategory): string {
    return CATEGORY_CONFIG[cat].icon;
  }
}
