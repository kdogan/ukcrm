import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Address, User } from '../../../core/models';
import { Observable, Subject, takeUntil } from 'rxjs';
import { UserState } from '../../../core/store/user.state';
import { Select, Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/service/api.service';
import { AddCustomer } from '../../../core/store/customers.action';

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrl: './create-customer.component.scss'
})
export class CreateCustomerComponent implements OnDestroy, OnInit {

  customerForm!: FormGroup;
  isAddressValid = false;
  address!: Address;
  destroyed$ = new Subject<void>();
  currentUser!:User;
  @Select(UserState.getCurrentUser) currentUser$: Observable<User> | undefined;


  constructor(private fb: FormBuilder, private store: Store, private router: Router, private apiService: ApiService, ) { }
  ngOnInit() {
    this.customerForm = this.fb.group({
      firstname: [''],
      lastname: [''],
      address: [''],
      phone: [''],
      email: ['']
    });
    this.currentUser$?.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (user) =>{
        if(user){
          this.currentUser = user;
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSubmit() {
    this.addCustomer()
  }

  addCustomer() {
    if (!this.isAddressValid) {
      return;
    }
    this.apiService.addCustomer({
      firstname: this.customerForm.get('firstname')?.value,
      lastname: this.customerForm.get('lastname')?.value,
      phone: this.customerForm.get('phone')?.value,
      email: this.customerForm.get('email')?.value,
      address: this.address,
      contracts:[]
    }).pipe(takeUntil(this.destroyed$)).subscribe(
      {
        next: (c) => this.store.dispatch(new AddCustomer(c)),
        error: (error) => console.error("Zähler konnte nicht erstellt werden, Fehler: ", error),
        complete: () => this.router.navigate(['zaehler'])
      }
    )
  }
}
