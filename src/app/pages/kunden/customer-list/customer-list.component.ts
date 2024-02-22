import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Address, Customer } from '../../../core/models';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/service/api.service';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { SetCurentCustomer } from '../../../core/store/customers.action';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss'
})
export class CustomerListComponent {

  isMobile = false;
  filteredCustomers: Customer[] = [];
  destroyed$ = new Subject<void>();

  @Input() maxTasksToShow = 20;
  @Input() customers:Customer[]|undefined;
  @Input() withActions = true;
  @Output() selected = new EventEmitter<Customer>();
  

  selectedCustomer!: Customer|undefined;
  
  showModal: boolean = false;
  
  constructor(private readonly route: Router, private apiService:ApiService, private store:Store) { }

  closeModal() {
    this.showModal = false;
    this.selectedCustomer = undefined;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  getAddress(address: Address|undefined) {
    if(!address) return ""
   return `${address.street}, ${address.zipCode} ${address.city}`;
  }

  goToCustomer(customer: Customer) {
    this.store.dispatch(new SetCurentCustomer(customer))
    this.route.navigate(['kunden/view'])
    }

  selectCustomer(customer:Customer){
    if(!this.withActions){
      this.selected.next(customer)
      this.selectedCustomer = customer;
    }
  }
  }
