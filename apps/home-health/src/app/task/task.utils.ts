import { mockTasks, Task } from './mock-tasks';

function getNextDueDate(lastDone: string, cycleDays: number): string {
  const last = new Date(lastDone);
  last.setDate(last.getDate() + cycleDays);
  return last.toISOString().slice(0, 10);
}

export function getTaskStatus(task: Task): 'upcoming' | 'normal' | 'overdue' {
  const nextDue = new Date(getNextDueDate(task.lastDone, task.cycleDays));
  const today = new Date();
  if (nextDue < today) return 'overdue';
  const diff = (nextDue.getTime() - today.getTime()) / (1000 * 3600 * 24);
  if (diff <= 7) return 'upcoming';
  return 'normal';
}

export function getTasksWithNextDue() {
  return mockTasks.map(task => ({
    ...task,
    nextDue: getNextDueDate(task.lastDone, task.cycleDays),
    status: getTaskStatus(task),
  }));
}
