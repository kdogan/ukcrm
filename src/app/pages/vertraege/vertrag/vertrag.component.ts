import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, map, of, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Customer, Contract } from '../../../core/models';
import { ContractsState } from '../../../core/store/contracts.state';
import { CustomersState } from '../../../core/store/customers.state';

@Component({
  selector: 'app-vertrag',
  templateUrl: './vertrag.component.html',
  styleUrl: './vertrag.component.scss'
})
export class VertragComponent {

  @Select(CustomersState.getAllCustomers) customers$: Observable<Customer[]> | undefined;
  
  @Select(ContractsState.getContractById) getContractById$: Observable<Contract> | undefined;
  contract$: Observable<Contract|undefined>;
  customer$: Observable<Customer|undefined>;

  constructor(private readonly route: ActivatedRoute, private readonly store: Store) {
    this.contract$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('vertragnummer');
        if (id !== null) {
          return this.store.select(ContractsState.getContractById).pipe(map(filterFn => filterFn(id)));
        } else {
          return of(undefined);
        }
      })
    );

    this.customer$ = this.contract$.pipe(
      switchMap(contract => {
        if(contract?.kundennummer){
          return this.store.select(CustomersState.getCustomertById).pipe(map(filterFn => filterFn(contract.kundennummer)));
        } else {
          return of(undefined)
        }
      }));
  }
}
