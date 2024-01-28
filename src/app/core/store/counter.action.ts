import { Counter } from "../models";

export class AddCounter {
    static readonly type = '[Counter] Add';
    constructor(public payload: Counter) {}
  }

export class AddAllCounters {
  static readonly type = '[Counter] Add all';
    constructor(public payload: Counter[]) {}
}