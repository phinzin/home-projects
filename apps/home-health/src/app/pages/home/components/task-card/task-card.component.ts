import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Calendar, Clock, Trash2, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html'
})
export class TaskCardComponent {

  @Input() task: any;
  @Input() dueDate!: Date;
  @Input() daysRemaining!: number;
  @Input() status!: any;

  @Output() complete = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  formatDate(date: Date | string) {
    return new Intl.DateTimeFormat('vi-VN').format(new Date(date));
  }
}
