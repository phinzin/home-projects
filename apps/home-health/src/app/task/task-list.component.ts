import { Component } from '@angular/core';
import { getTasksWithNextDue } from './task.utils';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from './mock-tasks';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="task-list-container">
      <div class="header">
        <span class="header-icon">🏡</span>
        <h2>Quản lý công việc gia đình</h2>
      </div>
      <div *ngIf="upcomingTasks.length" class="section">
        <h3 class="section-title"><span class="section-icon">⏰</span> Sự kiện sắp đến</h3>
        <div *ngFor="let task of upcomingTasks" class="task-card upcoming">
          <div class="task-title">{{ task.name }}</div>
          <div>Ngày thực hiện gần nhất: <b>{{ task.lastDone }}</b></div>
          <div>Ngày đến kỳ tiếp theo: <b>{{ task.nextDue }}</b></div>
          <div>
            Ghi chú:
            <input [(ngModel)]="task.note" placeholder="Thêm ghi chú..." style="width: 70%" />
          </div>
          <div class="task-actions">
            <button (click)="markDoneToday(task)">Đã làm hôm nay</button>
          </div>
          <div class="task-status upcoming">Sắp đến kỳ!</div>
        </div>
      </div>
      <div class="section">
        <h3 class="section-title"><span class="section-icon">📋</span> Tất cả công việc</h3>
        <div *ngFor="let task of otherTasks" class="task-card" [ngClass]="task.status">
          <div class="task-title">{{ task.name }}</div>
          <div>Ngày thực hiện gần nhất: <b>{{ task.lastDone }}</b></div>
          <div>Ngày đến kỳ tiếp theo: <b>{{ task.nextDue }}</b></div>
          <div>
            Ghi chú:
            <input [(ngModel)]="task.note" placeholder="Thêm ghi chú..." style="width: 70%" />
          </div>
          <div class="task-actions">
            <button (click)="markDoneToday(task)">Đã làm hôm nay</button>
          </div>
          <div class="task-status" [ngClass]="task.status">
            <span *ngIf="task.status === 'overdue'" class="overdue">Quá hạn!</span>
            <span *ngIf="task.status === 'upcoming'" class="upcoming">Sắp đến kỳ!</span>
            <span *ngIf="task.status === 'normal'" class="normal">Bình thường</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent {
  allTasks = getTasksWithNextDue();
  upcomingTasks = this.allTasks.filter(t => t.status === 'upcoming');
  otherTasks = this.allTasks.filter(t => t.status !== 'upcoming');

  markDoneToday(task: Task) {
    const today = new Date().toISOString().slice(0, 10);
    task.lastDone = today;
    const cycleDays = task.cycleDays;
    const nextDue = new Date(today);
    nextDue.setDate(nextDue.getDate() + cycleDays);
    task.nextDue = nextDue.toISOString().slice(0, 10);
    // Tính lại trạng thái
    const nextDueDate = new Date(task.nextDue);
    const now = new Date();
    if (nextDueDate < now) task.status = 'overdue';
    else if ((nextDueDate.getTime() - now.getTime()) / (1000 * 3600 * 24) <= 7) task.status = 'upcoming';
    else task.status = 'normal';
    // Cập nhật lại danh sách
    this.upcomingTasks = this.allTasks.filter(t => t.status === 'upcoming');
    this.otherTasks = this.allTasks.filter(t => t.status !== 'upcoming');
  }
}
