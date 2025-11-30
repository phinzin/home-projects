import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { StatsSummaryComponent } from './components/stats-summary/stats-summary.component';
import { Home, Plus } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'app-home-manager',
  imports: [
    CommonModule,
    TaskListComponent,
    TaskFormComponent,
    StatsSummaryComponent,
  ],
  templateUrl: './home-manager.page.html'
})
export class HomeManagerPage {

  tasks: any[] = [];
  showForm = false;

  constructor() {
    const saved = localStorage.getItem('houseTasks');
    this.tasks = saved ? JSON.parse(saved) : [];
  }

  ngDoCheck() {
    localStorage.setItem('houseTasks', JSON.stringify(this.tasks));
  }

  // helpers and handlers are same as before...
  getNextDueDate(last: string, cycle: number, unit: string): Date {
    const d = new Date(last);
    if (unit === 'months') d.setMonth(d.getMonth() + cycle);
    else if (unit === 'days') d.setDate(d.getDate() + cycle);
    else d.setFullYear(d.getFullYear() + cycle);
    return d;
  }
  getDaysRemaining(d: Date) {
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(d); due.setHours(0,0,0,0);
    return Math.ceil((due.getTime() - today.getTime()) / 86400000);
  }
  getStatus(days: number) {
    if (days < 0) return { label:'Quá hạn', color:'bg-red-100 text-red-700', bar:'bg-red-500' };
    if (days <= 7) return { label:'Sắp đến', color:'bg-yellow-100 text-yellow-700', bar:'bg-yellow-500' };
    return { label:'Còn tốt', color:'bg-green-100 text-green-700', bar:'bg-green-500' };
  }

  addTask(task: any) { this.tasks.push({ ...task, id: Date.now() }); }
  complete(id: number) {
    const today = new Date().toISOString().split('T')[0];
    this.tasks = this.tasks.map(t => t.id === id ? { ...t, lastDate: today } : t);
  }
  delete(id: number) { this.tasks = this.tasks.filter(t => t.id !== id); }
}
