import { Component, Input } from '@angular/core';
import { Address, Contract, ContractState, Counter } from '../../../core/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-counter-list',
  templateUrl: './counter-list.component.html',
  styleUrl: './counter-list.component.scss',
})
export class CounterListComponent {


  isMobile = false;
  @Input() counters!: Counter[];
  selectedTask: Contract | null = null;
  showModal: boolean = false;
  displayedColumns: string[] = ['zaehlernummer', 'address', 'type', 'actions'];
  constructor(private readonly route: Router) { }

  showVertrag(vertrag: Contract) {
    this.route.navigate(['vertraege/view', vertrag.vertragnummer])
  }

  deleteVertrag(_t67: any) {
    throw new Error('Method not implemented.');
  }
  editVertrag(_t67: any) {
    throw new Error('Method not implemented.');
  }
  getAddress(address: Address) {
   return `${address.street}, ${address.zipCode} ${address.city}`;
  }
}
