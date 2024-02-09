import { Component } from '@angular/core';
import { Counter, Task } from '../../core/models';
import { Select, Store } from '@ngxs/store';
import { TasksState } from '../../core/store/tasks.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  @Select(TasksState.getAllTasks) tasks$: Observable<Task[]> | undefined;
  constructor(private store:Store) {

  }
}
