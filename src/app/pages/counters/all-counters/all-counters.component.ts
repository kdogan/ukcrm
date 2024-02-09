import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Counter } from '../../../core/models';
import { Select } from '@ngxs/store';
import { CountersState } from '../../../core/store/counters.state';

@Component({
  selector: 'app-all-counters',
  templateUrl: './all-counters.component.html',
  styleUrl: './all-counters.component.scss'
})
export class AllCountersComponent {

  @Select(CountersState.getAllCounters) counters$: Observable<Counter[]> | undefined;

  addCounter() {
    console.log('Neuer Vertrag hinzufügen');
  }
}
