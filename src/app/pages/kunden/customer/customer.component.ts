import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Address, Customer } from '../../../core/models';
import { Select, Store } from '@ngxs/store';
import { CustomersState } from '../../../core/store/customers.state';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/service/api.service';
import { UserState } from '../../../core/store/user.state';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent implements OnInit, OnDestroy{

  @Select(CustomersState.getCurrentCustomer) customer$: Observable<Customer> | undefined;
  address = "";
  note = "";
  destroyed$ = new Subject<void>();
  constructor(private readonly apiService: ApiService, private readonly store:Store){

  }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }
  ngOnInit() {
    this.customer$?.pipe().subscribe({
      next: (customer)=>{
        if(customer){
          this.address = `${customer.address?.street}, ${customer.address?.zipCode} ${customer.address?.city}`;
          if(customer._id)
          {this.apiService.fetchNoteForCustomer(customer._id).pipe(takeUntil(this.destroyed$)).subscribe({
            next:(note => this.note = note.text)
          })}
        }
        }
    })
   }

   addNote(customerId:string|undefined) {
    if(!customerId) return;
    this.apiService.addNote({
      text:"Das ist ein zum testen ersten Notiz und kommt aus dem Backend",
      customerId:customerId,
      user_id:this.store.selectSnapshot(UserState).currentUser._id??"",
    })
   }

   showNote(){

   }
}
