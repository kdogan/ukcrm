import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { AddCounter } from '../../../core/store/counter.action';
import { Address, User } from '../../../core/models';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/service/api.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { UserState } from '../../../core/store/user.state';

@Component({
  selector: 'app-create-counter',
  templateUrl: './create-counter.component.html',
  styleUrl: './create-counter.component.scss'
})
export class CreateCounterComponent implements OnInit, OnDestroy {

  counterForm!: FormGroup;
  isAddressValid = false;
  address!: Address;
  destroyed$ = new Subject<void>();
  @Select(UserState.getCurrentUser) currentUser$: Observable<User> | undefined;
  currentUser!:User;
  constructor(private fb: FormBuilder, private store: Store, private router: Router, private apiService: ApiService, ) { }

  ngOnInit() {
    this.counterForm = this.fb.group({
      id: [''],
      zaehlernummer: [''],
      address: [''],
      type: ['']
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
    this.addCounter()
  }

  // getAddress(): Address {
  //   return {
  //     street: this.counterForm.get['address'].get('street')?.value,
  //     zipCode: this.counterForm.get['address'].get('zipCode')?.value,
  //     city: this.counterForm.get['address'].get('city')?.value,
  //     country: this.counterForm.get['address'].get('country')?.value ?? "Deutschland",
  //   }
  // }
  addCounter() {
    if (!this.isAddressValid) {
      return;
    }
    this.apiService.addCounter({
      zaehlernummer: this.counterForm.get('zaehlernummer')?.value,
      address: this.address,
      type: this.counterForm.get('type')?.value,
      user: this.currentUser._id
    }).pipe(takeUntil(this.destroyed$)).subscribe(
      {
        next: (c) => this.store.dispatch(new AddCounter(c)),
        error: (error) => console.error("Zähler konnte nicht erstellt werden, Fehler: ", error),
        complete: () => this.router.navigate(['zaehler'])
      }
    )
  }
}
