import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Subject, Observable, takeUntil } from 'rxjs';
import { Counter, Address } from '../../core/models';
import { CountersState } from '../../core/store/counters.state';

@Component({
  selector: 'app-counters-dialog',
  templateUrl: './counters-dialog.component.html',
  styleUrl: './counters-dialog.component.scss'
})
export class CountersDialogComponent {

  counters!:Counter[];
  filteredCounters!:Counter[];
  destroyed$ = new Subject<void>();
  selected!:Counter;

  @Select(CountersState.getAllCounters) counters$!: Observable<Counter[]>;
  constructor(
    public dialogRef: MatDialogRef<CountersDialogComponent>
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.counters$?.pipe(takeUntil(this.destroyed$)).subscribe({
      next:(counters: Counter[])=>{
        this.filteredCounters = counters;
        this.counters = counters;
      }
    })
  }

  add(): void {
    this.dialogRef.close(this.selected);
  }

  close(): void {
    this.dialogRef.close();
  }

  getAddress(address: Address|undefined) {
    if(!address) return ""
   return `${address.street}, ${address.zipCode} ${address.city}`;
  }
  filterContracts(searchTerm: string) {
    if (!searchTerm) {
      this.filteredCounters = this.counters;
    } else {
      this.filteredCounters = this.counters.filter(
        counters =>
        this.getAddress(counters.address).toLowerCase().includes(searchTerm.toLowerCase()) ||
        counters.zaehlernummer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }
}
