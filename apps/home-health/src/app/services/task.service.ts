import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Task, Status, TaskStats, TaskCategory, CompletionRecord } from '../models/maintenance-tracker.model';

const STORAGE_KEY = 'home-health-tasks';
const ODO_STORAGE_KEY = 'home-health-current-odo';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private tasks = signal<Task[]>([]);
  private currentOdo = signal<number>(0);
  private editingTask = signal<Task | null>(null);

  // Computed values
  readonly taskList = computed(() => this.tasks());
  readonly currentOdoValue = computed(() => this.currentOdo());
  readonly isEditing = computed(() => this.editingTask() !== null);
  readonly editingTaskData = computed(() => this.editingTask());

  readonly tasksWithStatus = computed(() => {
    const odo = this.currentOdo();
    return this.tasks()
      .map(task => ({
        ...task,
        status: this.calculateStatus(task, odo)
      }))
      .sort((a, b) => b.status.progressPercent - a.status.progressPercent);
  });

  readonly stats = computed<TaskStats>(() => {
    const tasksWithStatus = this.tasksWithStatus();
    return {
      total: tasksWithStatus.length,
      overdue: tasksWithStatus.filter(t => t.status.color === 'red').length,
      dueSoon: tasksWithStatus.filter(t => t.status.color === 'yellow').length,
      onTrack: tasksWithStatus.filter(t => t.status.color === 'green').length,
      noData: tasksWithStatus.filter(t => t.status.color === 'gray').length
    };
  });

  constructor() {
    if (this.isBrowser) {
      this.loadFromStorage();

      // Auto-save to localStorage when tasks change
      effect(() => {
        const tasks = this.tasks();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      });

      effect(() => {
        const odo = this.currentOdo();
        localStorage.setItem(ODO_STORAGE_KEY, JSON.stringify(odo));
      });
    }
  }

  private loadFromStorage(): void {
    if (!this.isBrowser) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const tasks = JSON.parse(stored) as Task[];
        // Ensure backwards compatibility - add missing fields
        const migratedTasks = tasks.map(task => ({
          ...task,
          category: task.category || 'other',
          history: task.history || []
        }));
        this.tasks.set(migratedTasks);
      }

      const storedOdo = localStorage.getItem(ODO_STORAGE_KEY);
      if (storedOdo) {
        this.currentOdo.set(JSON.parse(storedOdo));
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
  }

  addTask(taskData: Omit<Task, 'id' | 'timestamp' | 'history'>): Task {
    const now = Date.now();
    const newTask: Task = {
      ...taskData,
      id: this.generateId(),
      timestamp: now,
      history: []
    };

    this.tasks.update(tasks => [...tasks, newTask]);
    return newTask;
  }

  updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'timestamp'>>): boolean {
    const taskIndex = this.tasks().findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;

    this.tasks.update(tasks => {
      const updated = [...tasks];
      updated[taskIndex] = { ...updated[taskIndex], ...updates };
      return updated;
    });
    return true;
  }

  deleteTask(taskId: string): boolean {
    const taskIndex = this.tasks().findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;

    this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
    return true;
  }

  completeTask(taskId: string, value?: number, notes?: string): boolean {
    const task = this.tasks().find(t => t.id === taskId);
    if (!task) return false;

    const now = Date.now();
    const completionRecord: CompletionRecord = {
      completedAt: now,
      value: task.periodType === 'mileage' ? value : undefined,
      notes
    };

    const updates: Partial<Task> = {
      history: [...task.history, completionRecord]
    };

    if (task.periodType === 'time') {
      updates.lastCompletedDate = now;
    } else {
      updates.lastCompletedValue = value ?? this.currentOdo();
    }

    return this.updateTask(taskId, updates);
  }

  setCurrentOdo(value: number): void {
    this.currentOdo.set(value);
  }

  setEditingTask(task: Task | null): void {
    this.editingTask.set(task);
  }

  clearEditingTask(): void {
    this.editingTask.set(null);
  }

  getTasksByCategory(category: TaskCategory): Task[] {
    return this.tasks().filter(t => t.category === category);
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  calculateStatus(task: Task, currentOdo: number): Status {
    let status: Status = {
      text: 'Chua co du lieu',
      color: 'gray',
      nextDue: 'N/A',
      progressPercent: 0
    };

    if (task.periodType === 'time') {
      if (task.lastCompletedDate === null) {
        return status;
      }

      const lastDate = new Date(task.lastCompletedDate);
      const nextDueDate = new Date(lastDate);

      if (task.periodUnit === 'months') {
        nextDueDate.setMonth(nextDueDate.getMonth() + task.periodValue);
      } else if (task.periodUnit === 'days') {
        nextDueDate.setDate(nextDueDate.getDate() + task.periodValue);
      }

      const now = Date.now();
      const totalTime = nextDueDate.getTime() - lastDate.getTime();
      const elapsedTime = now - lastDate.getTime();
      const diffTime = nextDueDate.getTime() - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      status.nextDue = nextDueDate.toLocaleDateString('vi-VN');
      status.progressPercent = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
      status.daysRemaining = diffDays;

      if (diffTime <= 0) {
        status.text = `Qua han ${Math.abs(diffDays)} ngay!`;
        status.color = 'red';
        status.progressPercent = 100;
      } else if (diffDays <= 14) {
        status.text = `Con ${diffDays} ngay`;
        status.color = 'yellow';
      } else {
        status.text = `Con ${diffDays} ngay`;
        status.color = 'green';
      }
    } else if (task.periodType === 'mileage') {
      if (task.lastCompletedValue === null) {
        return status;
      }

      const nextMileage = task.lastCompletedValue + task.periodValue;
      const mileageUsed = currentOdo - task.lastCompletedValue;
      const mileageRemaining = nextMileage - currentOdo;

      status.progressPercent = Math.min(100, Math.max(0, (mileageUsed / task.periodValue) * 100));
      status.nextDue = `${nextMileage.toLocaleString('vi-VN')} KM`;
      status.kmRemaining = mileageRemaining;

      if (currentOdo === 0 && task.lastCompletedValue === 0) {
        status.text = 'Cap nhat KM hien tai!';
        status.color = 'gray';
        status.progressPercent = 0;
      } else if (currentOdo >= nextMileage) {
        status.text = `Qua han ${Math.abs(mileageRemaining).toLocaleString('vi-VN')} KM!`;
        status.color = 'red';
        status.progressPercent = 100;
      } else if (mileageRemaining <= 500) {
        status.text = `Con ${mileageRemaining.toLocaleString('vi-VN')} KM`;
        status.color = 'yellow';
      } else {
        status.text = `Con ${mileageRemaining.toLocaleString('vi-VN')} KM`;
        status.color = 'green';
      }
    }

    return status;
  }

  // Export/Import functionality
  exportTasks(): string {
    return JSON.stringify({
      tasks: this.tasks(),
      currentOdo: this.currentOdo(),
      exportedAt: Date.now()
    }, null, 2);
  }

  importTasks(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.tasks || !Array.isArray(data.tasks)) {
        return { success: false, message: 'Dinh dang file khong hop le' };
      }

      const migratedTasks = data.tasks.map((task: Task) => ({
        ...task,
        category: task.category || 'other',
        history: task.history || []
      }));

      this.tasks.set(migratedTasks);
      if (data.currentOdo) {
        this.currentOdo.set(data.currentOdo);
      }

      return { success: true, message: `Da nhap ${migratedTasks.length} cong viec` };
    } catch (e) {
      return { success: false, message: 'Loi khi doc file JSON' };
    }
  }
}
