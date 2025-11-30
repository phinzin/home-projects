import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule, FormsModule } from '@angular/common';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent {

  @Output() submitTask = new EventEmitter<any>();

  newTask = {
    name: '',
    cycle: '',
    unit: 'months',
    lastDate: new Date().toISOString().split('T')[0]
  };

  submit() {
    if (!this.newTask.name || !this.newTask.cycle || !this.newTask.lastDate) return;

    this.submitTask.emit({
      ...this.newTask,
      cycle: Number(this.newTask.cycle)
    });

    this.newTask = {
      name: '',
      cycle: '',
      unit: 'months',
      lastDate: new Date().toISOString().split('T')[0]
    };
  }
}
