import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Contract } from '../../../core/models';
import { ContractsState } from '../../../core/store/contracts.state';

@Component({
  selector: 'app-all-vertraege',
  templateUrl: './all-vertraege.component.html',
  styleUrl: './all-vertraege.component.scss'
})
export class AllVertraegeComponent {
  @Select(ContractsState.getAllContracts) contracts$: Observable<Contract[]> | undefined;
  addVertrag() {
    console.log('Neuer Vertrag hinzufügen');
  }
}
