import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskCardComponent } from '../task-card/task-card.component';
import { Wrench } from 'lucide-angular';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  templateUrl: './task-list.component.html'
})
export class TaskListComponent {

  @Input() tasks: any[] = [];
  @Input() getNextDueDate!: any;
  @Input() getDaysRemaining!: any;
  @Input() getStatus!: any;

  @Output() complete = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
}
