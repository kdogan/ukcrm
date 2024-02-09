import { Component } from '@angular/core';
import { CustomersState } from '../../../core/store/customers.state';
import { Observable } from 'rxjs';
import { Customer } from '../../../core/models';
import { Select } from '@ngxs/store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-customers',
  templateUrl: './all-customers.component.html',
  styleUrl: './all-customers.component.scss'
})
export class AllCustomersComponent {
  // customers:Customer[] = [];
  @Select(CustomersState.getAllCustomers) customers$: Observable<Customer[]> | undefined;

  constructor(private router: Router) {
    // this.customers$?.subscribe(customers => customers.forEach(c =>{
    //   console.log("customer ", c)
    //   this.customers.push(c)
    // }))
  }
  addCustomer() {
    this.router.navigate(['kunden/add'])
  }
}
