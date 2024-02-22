import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  MatDialogRef
} from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Address, Customer } from '../../core/models';
import { CustomersState } from '../../core/store/customers.state';

@Component({
  selector: 'app-customers-dialog',
  templateUrl: './customers-dialog.component.html',
  styleUrl: './customers-dialog.component.scss'

})
export class CustomersDialogComponent implements OnInit, OnDestroy {

  customers!:Customer[];
  filteredCustomers!:Customer[];
  destroyed$ = new Subject<void>();
  selected!:Customer;

  @Select(CustomersState.getAllCustomers) customers$!: Observable<Customer[]>;
  constructor(
    public dialogRef: MatDialogRef<CustomersDialogComponent>
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.customers$?.pipe(takeUntil(this.destroyed$)).subscribe({
      next:(customers: Customer[])=>{
        this.filteredCustomers = customers;
        this.customers = customers;
      }
    })
  }

  add(): void {
    this.dialogRef.close(this.selected);
  }

  close(): void {
    this.dialogRef.close();
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
