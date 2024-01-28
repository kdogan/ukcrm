import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../core/service/api.service';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngxs/store';
import { AddAllCounters, AddCounter } from '../../core/store/counter.action';

@Component({
  selector: 'app-counters',
  template: `<router-outlet></router-outlet>`
})
export class CountersComponent implements OnDestroy, OnInit {

  destroyed$ = new Subject<void>();
  constructor(private apiService:ApiService, private store:Store){
    
  }
  ngOnInit(): void {
    this.apiService.getAllCounters().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (counters) => {
        this.store.dispatch(new AddAllCounters(counters));
      },
      error: (error) => console.error("Fehler beim Abrufen der Zähler: ", error)
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
