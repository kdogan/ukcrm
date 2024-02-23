import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Address, Contract, ContractState, Counter } from '../../../core/models';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/service/api.service';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-counter-list',
  templateUrl: './counter-list.component.html',
  styleUrl: './counter-list.component.scss',
})
export class CounterListComponent {

  isMobile = false;
  filteredCounters: Counter[] = [];
  destroyed$ = new Subject<void>();

  @Input() maxTasksToShow = 20;
  @Input() counters: Counter[] | undefined;
  @Input() withActions = true;
  @Output() selected = new EventEmitter<Counter>();


  selectedCounter!: Counter | undefined;

  showModal: boolean = false;

  constructor(private readonly route: Router, private apiService: ApiService, private store: Store) { }

  closeModal() {
    this.showModal = false;
    this.selectedCounter = undefined;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  getAddress(address: Address | undefined) {
    if (!address) return ""
    return `${address.street}, ${address.zipCode} ${address.city}`;
  }

  goToCounter(customer: Counter) {
    //this.store.dispatch(new SetCurentCustomer(customer))
    this.route.navigate(['zaehler/view'])
  }

  selectCounter(counter: Counter) {
    if (!this.withActions) {
      this.selected.next(counter)
      this.selectedCounter = counter;
    }
  }
}
