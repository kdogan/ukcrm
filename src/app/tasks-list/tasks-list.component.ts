import { Component, Input } from '@angular/core';
import { Task } from '../tasks/tasks.component';

@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.scss'
})
export class TasksListComponent {

  @Input() tasks!:Task[];
  selectedTask: Task | null = null;
  showModal: boolean = false;
}
