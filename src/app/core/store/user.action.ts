import { User } from "../models";

export class SetCurrentUser {
    static readonly type = '[CurrentUser] Set';
    constructor(public payload: User) {}
  }