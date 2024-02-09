import { Contract } from "../models";

export class AddContract {
  static readonly type = '[Contract] Add';
  constructor(public payload: Contract) { }
}

export class AddAllContracts {
  static readonly type = '[Contract] Add all';
  constructor(public payload: Contract[]) { }
}