import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { AddAllContracts, AddContract } from './core/store/contract.action';
import { ApiService } from './core/service/api.service';
import { SetCurrentUser } from './core/store/user.action';
import { Subject, takeUntil } from 'rxjs';
import { AddAllTasks } from './core/store/tasks.action';
import { AddCustomer } from './core/store/customers.action';

@Component({
  selector: 'app-root',
  template: `<app-header></app-header>
             <app-breadcrumb></app-breadcrumb>
             <router-outlet></router-outlet>`
})
export class AppComponent {
  title = 'kdcrm';
  
  destroyed$ = new Subject<void>();
  customers = [
    {
        _id: "65be4d2f94de2a29161711c9",
        firstname: "Max",
        lastname: "Mustermann",
        email: "max.mustermann@musterdomain.de",
        phone: "434343003409093409",
        address: {
            street: "Dorfstr. 77",
            city: "Karlsruhe",
            zipCode: "76444",
            country: "Deutschland",
            _id: "65be4d2f94de2a29161711ca"
        },
        __v: 0
    },
    {
        _id: "65be4d2f94de2a29161711cc",
        firstname: "Max",
        lastname: "Mustermann",
        email: "max.mustermann@musterdomain.de",
        phone: "434343003409093409",
        address: {
            street: "Dorfstr. 77",
            city: "Karlsruhe",
            zipCode: "76444",
            country: "Deutschland",
            _id: "65be4d2f94de2a29161711cd"
        },
        __v: 0
    }
]

  constructor(private readonly store: Store, private apiService:ApiService) {
    this.apiService.getAllContracts().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (contracts) => {
        this.store.dispatch(new AddAllContracts(contracts));
      },
      error: (error) => console.error("Fehler beim Abrufen der Zähler: ", error)
    });

    this.apiService.getTasks().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (tasks) => {
        this.store.dispatch(new AddAllTasks(tasks));
      },
      error: (error) => console.error("Fehler beim Abrufen der Tasks: ", error)
    });

    this.apiService.getAllCustomers().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (customers) => {
        customers.forEach(c => this.store.dispatch(new AddCustomer({...c })))
        //this.store.dispatch(new AddAllCustomers(customers));
      },
      error: (error) => console.error("Fehler beim Abrufen der Kunden: ", error)
    });

    

    this.store.dispatch(new SetCurrentUser({
      address:{city:"Karlsruhe",country:"Deutschland",street:"FooStr. 11",zipCode:"76666"},
      email:"test@test.de",
      firstname:"Max",
      lastname:"Mustermann",
      middlename:"",
      phone:"11344",
      phone_mobile:"443344f",
      token:""
    }))
    
  }

}
