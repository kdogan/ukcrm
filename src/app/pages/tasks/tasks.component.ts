import { Component, OnDestroy } from '@angular/core';
import { Task, TaskStatus } from '../../core/models';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { TasksState } from '../../core/store/tasks.state';
import { ApiService } from '../../core/service/api.service';
import { AddTask } from '../../core/store/tasks.action';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})

export class TasksComponent implements OnDestroy {
  @Select(TasksState.getAllTasks) tasks$: Observable<Task[]> | undefined;
  destroyed$ = new Subject<void>();
  constructor(private readonly apiService:ApiService, private readonly store:Store){

  }
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  addTask() {
    this.apiService.addTask(
      { title: 'Der Vertrag v123456 läuft ab',description: 'Der Vertrag v123456 läuft ab', status: TaskStatus.ACTIVE }
      ).pipe(takeUntil(this.destroyed$)).subscribe({
        next:(task)=>this.store.dispatch(new AddTask(task))
      })

  }
}
