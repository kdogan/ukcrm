import { Component } from '@angular/core';
import { Contract } from '../../core/models';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ContractsState } from '../../core/store/contracts.state';

@Component({
  selector: 'app-all-vertraege',
  templateUrl: './all-vertraege.component.html',
  styleUrl: './all-vertraege.component.scss'
})
export class AllVertraegeComponent {
  @Select(ContractsState.getAllContracts) contracts$: Observable<Contract[]> | undefined;
  constructor(private readonly store: Store){

  }
  addVertrag() {
    console.log('Neuer Vertrag hinzufügen');
    
  }
}
