import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Customer } from '../models';
import { Injectable } from '@angular/core';

export class AddCustomer {
  static readonly type = '[Customer] Add';
  constructor(public payload: Customer) {}
}
export class CustomersStateModel {
  public customers: Customer[]=[];
}

@State<CustomersStateModel>({
  name: 'customers',
  defaults: {
    customers: []
  }
})

@Injectable()
export class CustomersState {
  @Selector()
  static getAllCustomers(state: Customer[]) {
    return state;
  }

  @Selector()
  static getCustomertById(state: CustomersStateModel) {
    return (customerId: string) => {
      return state.customers?.find(customer => customer._id === customerId);
    };
  }

  @Action(AddCustomer)
  add({ getState, patchState }: StateContext<CustomersStateModel>, { payload }: AddCustomer) {
    const state = getState();
    patchState({ customers: [...state.customers, payload] });
  }
}