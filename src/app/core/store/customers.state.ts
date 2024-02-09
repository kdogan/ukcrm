import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Customer } from '../models';
import { Injectable } from '@angular/core';
import { AddCustomer, DeleteCustomer, AddAllCustomers, SetCurentCustomer } from './customers.action';



export class CustomersStateModel {
  public customers: Customer[] = [];
  public currentCustomer:Customer|undefined=undefined;
}

@State<CustomersStateModel>({
  name: 'customers',
  defaults: {
    customers: [],
    currentCustomer:undefined
  }
})

@Injectable()
export class CustomersState {
  @Selector()
  static getAllCustomers(state: CustomersStateModel) {
    return state.customers;
  }
  @Selector()
  static getCurrentCustomer(state: CustomersStateModel) {
    return state.currentCustomer;
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

  @Action(SetCurentCustomer)
  setCurrentCustomer({ getState, setState }: StateContext<CustomersStateModel>, { payload }: SetCurentCustomer) {
    const state = getState();
    setState({ ...state, currentCustomer : payload });
  }
  
  @Action(DeleteCustomer)
  delete({ getState, setState }: StateContext<CustomersStateModel>, { payload }: DeleteCustomer) {
    const state = getState();
    const index = state.customers.findIndex(c => c._id === payload);

    if (index !== -1) {
      const updatedCustomers = [...state.customers];
      updatedCustomers.splice(index, 1);
      setState({
        ...state,
        customers: updatedCustomers
      });
    }
  }

  @Action(AddAllCustomers)
  addAll({ getState, patchState }: StateContext<CustomersStateModel>, { payload }: AddAllCustomers) {
    const state = getState();
    patchState({ customers: [...state.customers, ...payload] });
  }
}