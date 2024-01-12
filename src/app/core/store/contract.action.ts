import { Contract } from "../models";

export class AddContract {
    static readonly type = '[Contract] Add';
    constructor(public payload: Contract) {}
  }