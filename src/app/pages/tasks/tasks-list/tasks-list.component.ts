import { Component, Input, OnDestroy } from '@angular/core';
import { ApiService } from '../../../core/service/api.service';
import { Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';
import { UpdateTask } from '../../../core/store/tasks.action';
import { Task, TaskStatus } from '../../../core/models';

@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.scss'
})
export class TasksListComponent implements OnDestroy {


  @Input() tasks!:Task[];
  @Input() maxTasksToShow = 20;
  selectedTask: Task | null = null;
  showModal: boolean = false;
  destroyed$ = new Subject<void>();
  constructor(private apiService:ApiService, private store:Store){}

  closeModal() {
    this.showModal = false;
    this.selectedTask = null;
  }
  toggleTask(){
    if(!this.selectedTask|| !this.selectedTask._id) return;

    const newState = this.selectedTask?.status === TaskStatus.ACTIVE?TaskStatus.COMPLETED:TaskStatus.ACTIVE;
    this.selectedTask = {...this.selectedTask, status: newState}
    this.apiService.updateTask(this.selectedTask).pipe(takeUntil(this.destroyed$)).subscribe({
      next:(task)=> this.store.dispatch(new UpdateTask(task))
    })
  }
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
