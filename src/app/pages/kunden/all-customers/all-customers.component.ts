import { Component, OnDestroy, OnInit } from '@angular/core';
import { CustomersState } from '../../../core/store/customers.state';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Address, Customer } from '../../../core/models';
import { Select } from '@ngxs/store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-customers',
  templateUrl: './all-customers.component.html',
  styleUrl: './all-customers.component.scss'
})
export class AllCustomersComponent implements OnInit, OnDestroy {
  customers:Customer[]=[];
  filteredCustomers:Customer[]=[];
  destroyed$ = new Subject<void>();
  @Select(CustomersState.getAllCustomers) customers$!: Observable<Customer[]>;

  constructor(private router: Router) {
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  ngOnInit(): void {
    this.customers$?.pipe(takeUntil(this.destroyed$)).subscribe({
      next:(customers)=>{
        this.filteredCustomers = customers;
        this.customers = customers;
      }
    })
  }
  addCustomer() {
    this.router.navigate(['kunden/add'])
  }

  getAddress(address: Address|undefined) {
    if(!address) return ""
   return `${address.street}, ${address.zipCode} ${address.city}`;
  }
  
  filterContracts(searchTerm: string) {
    if (!searchTerm) {
      this.filteredCustomers = this.customers;
    } else {
      this.filteredCustomers = this.customers.filter(
        customers =>
        this.getAddress(customers.address).toLowerCase().includes(searchTerm.toLowerCase()) ||
        customers.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customers.lastname.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
      );
    }
  }

}
