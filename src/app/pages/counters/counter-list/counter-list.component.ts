import { Component, Input, OnInit } from '@angular/core';
import { Address, Contract, ContractState, Counter } from '../../../core/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-counter-list',
  templateUrl: './counter-list.component.html',
  styleUrl: './counter-list.component.scss',
})
export class CounterListComponent implements OnInit {

  isMobile = false;
  private _counters: Counter[] = [];
  filteredContracts: Counter[] = [];
  @Input() set counters(value: Counter[]) {
    this._counters = value || [];
    this.filteredContracts = this._counters;
  }

  selectedTask!: Counter;
  showModal: boolean = false;
  displayedColumns: string[] = ['zaehlernummer', 'address', 'type', 'actions'];



  constructor(private readonly route: Router) { }

  ngOnInit(): void {
  }
  get counters(): Counter[] {
    return this._counters;
  }
  showVertrag(counter: Counter) {
    this.route.navigate(['zaehler/view', counter.zaehlernummer])
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

  filterContracts(searchTerm: string) {
    if (!searchTerm) {
      this.filteredContracts = this.counters;
    } else {
      this.filteredContracts = this.counters.filter(
        counter =>
        this.getAddress(counter.address).toLowerCase().includes(searchTerm.toLowerCase()) ||
        counter.zaehlernummer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        counter.type.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
      );
    }
  }
}
