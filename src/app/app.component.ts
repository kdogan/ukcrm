import { Component } from '@angular/core';
import { Contract, ContractState, CounterType } from './core/models';
import { Store } from '@ngxs/store';
import { AddContract } from './core/store/contract.action';
import { AddCustomer } from './core/store/customers.state';
import { AddCounter } from './core/store/counter.action';

@Component({
  selector: 'app-root',
  template: `<app-header></app-header>
             <app-breadcrumb></app-breadcrumb>
             <router-outlet></router-outlet>`
})
export class AppComponent {
  title = 'kdcrm';
  contracts: Contract[] = [
    { id: "1234", zaehlernummer: 'D12345678', vertragnummer: 'D12345678', vertragstart: '31.08.2023', vertragsende: '31.08.2024', firma: "EnBW", kundennummer: "1234567", status: ContractState.ENTWURF },
    { id: "4321", zaehlernummer: 'ZDK776543', vertragnummer: 'D12345678', vertragstart: '31.08.2023', vertragsende: '31.08.2024', firma: "Rheinenergie", kundennummer: "7654321", status: ContractState.BELIEFERUNG },
    { id: "76543", zaehlernummer: 'ZDK11133', vertragnummer: 'D12345678', vertragstart: '31.08.2023', vertragsende: '31.08.2024', firma: "Vattenfall", kundennummer: "77774444", status: ContractState.BEENDET }
  ];
  customers = [
    { id: "1234567", firstname: "Murat", lastname: "Aydin" },
    { id: "77774444", firstname: "Ahmet", lastname: "Kürkcü" },
    { id: "7654321", firstname: "Sherif", lastname: "Cemal" },
  ]

  counters = [
    { zaehlernummer: '11111', address: { street: 'Dortstr. 77', city: 'Foostadt', zipCode: '77123', country: 'Fooland' }, id: 1, type: CounterType.STROM },
    { zaehlernummer: '22222', address: { street: 'Blastr. 32', city: 'Blastadt', zipCode: '75123', country: 'Fooland' }, id: 1, type: CounterType.STROM },
    { zaehlernummer: '33333', address: { street: 'Zortstr. 55', city: 'Zortstadt', zipCode: '33123', country: 'Fooland' }, id: 1, type: CounterType.GAS }
  ]
  constructor(private readonly store: Store) {
    this.contracts.forEach(c => this.store.dispatch(new AddContract(c)))
    this.customers.forEach(c => this.store.dispatch(new AddCustomer(c)))
    this.counters.forEach(c => this.store.dispatch(new AddCounter(c)))
  }

}
