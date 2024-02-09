import { Customer } from "../models";

export class AddCustomer {
  static readonly type = '[Customer] Add';
  constructor(public payload: Customer) { }
}
export class DeleteCustomer {
  static readonly type = '[Customer] Delete';
  constructor(public payload: string) { }
}
export class AddAllCustomers {
  static readonly type = '[Customer] Add all';
  constructor(public payload: Customer[]) { }
}

export class SetCurentCustomer {
  static readonly type = '[Customer] Set current customer';
  constructor(public payload: Customer) { }
}