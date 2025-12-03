import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewTask } from './components/new-task/new-task';
import { ListTask } from './components/list-task/list-task';

@Component({
  selector: 'app-home',
  imports: [CommonModule,
    NewTask,
    ListTask
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
