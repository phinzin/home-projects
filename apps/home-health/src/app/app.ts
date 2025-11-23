import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TaskListComponent } from './task/task-list.component';

@Component({
  imports: [RouterModule, TaskListComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'home-health';
}
