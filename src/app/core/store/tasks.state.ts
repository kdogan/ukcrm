import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Task } from '../models';
import { AddAllTasks, AddTask, UpdateTask } from './tasks.action';


export class TasksStateModel {
  public tasks: Task[]=[];
}

@State<TasksStateModel>({
  name: 'tasks',
  defaults: {
    tasks: []
  }
})
@Injectable()
export class TasksState {

  @Selector()
  static getAllTasks(state: TasksStateModel) {
    return state.tasks;
  }

  @Selector()
  static getTaskById(state: TasksStateModel) {
    return (id: string) => {
      return state.tasks?.find(task => task._id === id);
    };
  }

  @Action(AddTask)
  add({ getState, patchState }: StateContext<TasksStateModel>, { payload }: AddTask) {
    const state = getState();
    patchState({ tasks: [...state.tasks, payload] });
  }

  @Action(UpdateTask)
  update({ getState, setState }: StateContext<TasksStateModel>, { payload }: UpdateTask) {
    const state = getState();
    const updatedTasks = state.tasks.map(task => {
      if (task._id === payload._id) {
        return { ...task, ...payload };
      } else {
        return task;
      }
    });
    setState({...state, tasks: updatedTasks});
  }

  @Action(AddAllTasks)
  addAll({ getState, patchState }: StateContext<TasksStateModel>, { payload }: AddAllTasks) {
    const state = getState();
    patchState({ tasks: [...state.tasks, ...payload] });
  }
}