import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Address, Customer, Note } from '../../../core/models';
import { Select, Store } from '@ngxs/store';
import { CustomersState } from '../../../core/store/customers.state';
import { BehaviorSubject, Observable, Subject, map, of, switchMap, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/service/api.service';
import { UserState } from '../../../core/store/user.state';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent implements OnInit, OnDestroy{

  @Select(CustomersState.getCurrentCustomer) customer$: Observable<Customer> | undefined;
  address = "";
  note!:Observable<Note|null>;
  currentNote!:Note|null;
  destroyed$ = new Subject<void>();
  constructor(private readonly apiService: ApiService, private readonly store:Store){

  }
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  
   ngOnInit() {
    this.customer$?.pipe(
      switchMap(customer => 
        customer && customer._id ? this.apiService.fetchNoteForCustomer(customer._id) : of(null)
      ),
      map(notes => notes && notes.length > 0 ? notes[0] : null)
    ).subscribe(note => {
      this.currentNote = note;
      this.note = of(note);
    });
  }

   addNote(noteText:string, customerId:string|undefined) {
    if(!customerId) return;
    const userId = this.store.selectSnapshot(UserState).currentUser._id??""
    this.apiService.addNote({
      text:noteText,
      customerId:customerId,
      user_id:userId,
    }).subscribe();
   }

   updateNote(noteText:string, customerId:string|undefined){
    if(!customerId || !this.currentNote) return;
    const userId = this.store.selectSnapshot(UserState).currentUser._id??""
    this.currentNote.text = noteText;
    this.apiService.updateNote(this.currentNote).subscribe();
   }
}
