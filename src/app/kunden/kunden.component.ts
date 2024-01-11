import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Customer } from '../core/models';
import { AddCustomer, CustomersState } from '../core/store/customers.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-kunden',
  templateUrl: './kunden.component.html',
  styleUrl: './kunden.component.scss'
})
export class KundenComponent {

  constructor(private store: Store) {}
  @Select(CustomersState.getAllCustomers) customers$: Observable<Customer[]> | undefined;
  addCustomer(customer: Customer) {
    this.store.dispatch(new AddCustomer(customer));
  }
}
