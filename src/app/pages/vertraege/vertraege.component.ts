import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/service/api.service';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngxs/store';
import { AddAllContracts } from '../../core/store/contract.action';

@Component({
  selector: 'app-vertraege',
  template: `<router-outlet></router-outlet>`
})
export class VertraegeComponent implements OnInit {
  destroyed$ =  new Subject<void>();

  constructor(private apiService:ApiService, private store:Store){  }

  ngOnInit(): void {
    this.apiService.getAllContracts().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (contracts) => {
        this.store.dispatch(new AddAllContracts(contracts));
      },
      error: (error) => console.error("Fehler beim Abrufen der Zähler: ", error)
    });
  }
}
