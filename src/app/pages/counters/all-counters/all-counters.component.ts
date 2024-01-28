import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Contract, Counter, CounterType } from '../../../core/models';
import { Select, Store } from '@ngxs/store';
import { CountersState } from '../../../core/store/counters.state';
import { AddCounter } from '../../../core/store/counter.action';

@Component({
  selector: 'app-all-counters',
  templateUrl: './all-counters.component.html',
  styleUrl: './all-counters.component.scss'
})
export class AllCountersComponent {

  @Select(CountersState.getAllCounters) counters$: Observable<Counter[]> | undefined;
  constructor(){
    this.counters$?.subscribe(c =>console.log(c))
  }
  addCounter() {
    console.log('Neuer Vertrag hinzufügen');
  }
}
