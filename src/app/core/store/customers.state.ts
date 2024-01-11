import { State, Action, StateContext, Selector } from '@ngxs/store';

export class AddCustomer {
  static readonly type = '[Customer] Add';
  constructor(public payload: Customer) {}
}

export interface Customer {
  id: string;
  name: string;
  // Weitere Eigenschaften...
}

@State<Customer[]>({
  name: 'customers',
  defaults: []
})
export class CustomersState {
  @Selector()
  static getAllCustomers(state: Customer[]) {
    return state;
  }

  @Action(AddCustomer)
  add({ getState, patchState }: StateContext<Customer[]>, { payload }: AddCustomer) {
    const state = getState();
    patchState([...state, payload]);
  }
}