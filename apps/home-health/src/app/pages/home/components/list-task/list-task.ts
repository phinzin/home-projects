import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskCategory, CATEGORY_CONFIG } from '../../../../models/maintenance-tracker.model';
import { TaskService } from '../../../../services/task.service';
import { ToastService } from '../../../../services/toast.service';

type FilterStatus = 'all' | 'overdue' | 'due-soon' | 'on-track';
type SortBy = 'urgency' | 'name' | 'category' | 'date';

@Component({
  selector: 'app-list-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-task.html',
  styleUrl: './list-task.scss',
})
export class ListTask {
  private taskService = inject(TaskService);
  private toastService = inject(ToastService);

  // Filter & Sort state
  filterStatus = signal<FilterStatus>('all');
  filterCategory = signal<TaskCategory | 'all'>('all');
  sortBy = signal<SortBy>('urgency');
  searchQuery = signal('');

  // Modal state
  deleteModalOpen = signal(false);
  completeModalOpen = signal(false);
  taskToDelete = signal<Task | null>(null);
  taskToComplete = signal<Task | null>(null);

  // ODO input
  currentOdoInput = signal<number | null>(null);

  // Category options
  categories = Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
    value: key as TaskCategory,
    ...config
  }));

  // Get tasks from service
  readonly tasksWithStatus = computed(() => {
    let tasks = this.taskService.tasksWithStatus();

    // Apply search filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      tasks = tasks.filter(t =>
        t.taskName.toLowerCase().includes(query) ||
        t.notes?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    const status = this.filterStatus();
    if (status !== 'all') {
      tasks = tasks.filter(t => {
        switch (status) {
          case 'overdue': return t.status.color === 'red';
          case 'due-soon': return t.status.color === 'yellow';
          case 'on-track': return t.status.color === 'green';
          default: return true;
        }
      });
    }

    // Apply category filter
    const category = this.filterCategory();
    if (category !== 'all') {
      tasks = tasks.filter(t => t.category === category);
    }

    // Apply sorting
    const sort = this.sortBy();
    return [...tasks].sort((a, b) => {
      switch (sort) {
        case 'urgency':
          return b.status.progressPercent - a.status.progressPercent;
        case 'name':
          return a.taskName.localeCompare(b.taskName, 'vi');
        case 'category':
          return a.category.localeCompare(b.category);
        case 'date':
          return b.timestamp - a.timestamp;
        default:
          return 0;
      }
    });
  });

  readonly stats = this.taskService.stats;
  readonly currentOdo = this.taskService.currentOdoValue;
  readonly hasAnyTasks = computed(() => this.taskService.taskList().length > 0);

  // Methods
  openDeleteModal(task: Task): void {
    this.taskToDelete.set(task);
    this.deleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.deleteModalOpen.set(false);
    this.taskToDelete.set(null);
  }

  confirmDelete(): void {
    const task = this.taskToDelete();
    if (task) {
      this.taskService.deleteTask(task.id);
      this.toastService.success(`Đã xóa "${task.taskName}"`);
    }
    this.closeDeleteModal();
  }

  openCompleteModal(task: Task): void {
    this.taskToComplete.set(task);
    this.completeModalOpen.set(true);
  }

  closeCompleteModal(): void {
    this.completeModalOpen.set(false);
    this.taskToComplete.set(null);
  }

  confirmComplete(data: { value?: number; notes?: string }): void {
    const task = this.taskToComplete();
    if (task) {
      this.taskService.completeTask(task.id, data.value, data.notes);
      this.toastService.success(`Đã hoàn thành "${task.taskName}"`);
    }
    this.closeCompleteModal();
  }

  editTask(task: Task): void {
    this.taskService.setEditingTask(task);
    // Scroll to top where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateCurrentOdo(): void {
    const value = this.currentOdoInput();
    if (value !== null && value >= 0) {
      this.taskService.setCurrentOdo(value);
      this.toastService.success(`Đã cập nhật ODO: ${value.toLocaleString('vi-VN')} KM`);
    }
  }

  // UI Helper methods
  getBadgeClasses(color: string): string {
    const colorMap: Record<string, string> = {
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500',
      gray: 'bg-gray-500'
    };
    return colorMap[color] || 'bg-gray-500';
  }

  getProgressBarClasses(color: string): string {
    const colorMap: Record<string, string> = {
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500',
      gray: 'bg-gray-400'
    };
    return colorMap[color] || 'bg-gray-400';
  }

  getCardClasses(color: string): string {
    const colorMap: Record<string, string> = {
      red: 'border-l-red-500 bg-gradient-to-r from-red-50 to-white',
      yellow: 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white',
      green: 'border-l-green-500 bg-gradient-to-r from-green-50 to-white',
      gray: 'border-l-gray-400 bg-gradient-to-r from-gray-50 to-white'
    };
    return colorMap[color] || 'border-l-gray-400 bg-gray-50';
  }

  getLastValueText(task: Task): string {
    if (task.periodType === 'time' && task.lastCompletedDate) {
      return new Date(task.lastCompletedDate).toLocaleDateString('vi-VN');
    }
    if (task.periodType === 'mileage' && task.lastCompletedValue !== null) {
      return `${task.lastCompletedValue.toLocaleString('vi-VN')} KM`;
    }
    return 'Chưa có';
  }

  getPeriodText(task: Task): string {
    if (task.periodType === 'time') {
      const unit = task.periodUnit === 'months' ? 'tháng' : 'ngày';
      return `${task.periodValue} ${unit}`;
    }
    return `${task.periodValue.toLocaleString('vi-VN')} KM`;
  }

  getCategoryInfo(category: TaskCategory) {
    return CATEGORY_CONFIG[category];
  }

  getStatusIcon(color: string): string {
    const icons: Record<string, string> = {
      red: '🔴',
      yellow: '🟡',
      green: '🟢',
      gray: '⚪'
    };
    return icons[color] || '⚪';
  }
}
