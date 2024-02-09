import { Task } from "../models";

export class AddTask {
    static readonly type = '[Task] Add';
    constructor(public payload: Task) {}
  }

export class AddAllTasks {
  static readonly type = '[Task] Add all';
    constructor(public payload: Task[]) {}
}

export class UpdateTask {
  static readonly type = '[Task] Update';
  constructor(public payload: Task) {}
}