import { Component } from '@angular/core';
import { Contract, ContractState } from '../core/models';

@Component({
  selector: 'app-counter-list',
  templateUrl: './counter-list.component.html',
  styleUrl: './counter-list.component.scss',
})
export class CounterListComponent {

  contracts: Contract[] = [
    // Beispiel-Daten
    { id: '1', zaehlernummer: '123', vertragnummer: '456', firma: 'Beispiel GmbH', vertragstart: '2024-01-01', vertragsende: '2025-01-01', status: ContractState.BEARBEITUNG, kundennummer: '789' },
    { id: '2', zaehlernummer: 'd13234394390', vertragnummer: '457', firma: 'Foo GmbH', vertragstart: '2024-01-01', vertragsende: '2025-01-01', status: ContractState.BEARBEITUNG, kundennummer: '789' },
    // Weitere Contract-Objekte...
  ];
}
