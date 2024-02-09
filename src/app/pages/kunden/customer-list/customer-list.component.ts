import { Component, Input } from '@angular/core';
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
  
  // @Input() set customers(value: Customer[]) {
  //   this._customers = value || [];
  //   this.filteredCustomers = value;
  // }

  selectedTask!: Customer|undefined;
  
  showModal: boolean = false;
  
  constructor(private readonly route: Router, private apiService:ApiService, private store:Store) { }

  closeModal() {
    this.showModal = false;
    this.selectedTask = undefined;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  getAddress(address: Address) {
   return `${address.street}, ${address.zipCode} ${address.city}`;
  }

  goToCustomer(customer: Customer) {
    this.store.dispatch(new SetCurentCustomer(customer))
    this.route.navigate(['kunden/view'])
    }

  filterContracts(searchTerm: string) {
    // if (!searchTerm) {
    //   this.filteredCustomers = this.customers;
    // } else {
    //   this.filteredCustomers = this.customers.filter(
    //     customers =>
    //     this.getAddress(customers.address).toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     customers.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     customers.lastname.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
    //   );
    // }
  }
}
