import { Counter } from "../models";

export class AddCounter {
    static readonly type = '[Counter] Add';
    constructor(public payload: Counter) {}
  }