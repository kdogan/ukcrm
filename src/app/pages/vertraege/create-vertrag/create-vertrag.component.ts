import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from '../../../core/service/api.service';
import { Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';
import { AddContract } from '../../../core/store/contract.action';
import { Contract, ContractState, Counter, Customer } from '../../../core/models';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CustomersDialogComponent } from '../../../dialogs/customers-dialog/customers-dialog.component';
import { CountersDialogComponent } from '../../../dialogs/counters-dialog/counters-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-vertrag',
  templateUrl: './create-vertrag.component.html',
  styleUrl: './create-vertrag.component.scss'
})
export class CreateVertragComponent implements OnInit, OnDestroy {

  vertragForm!: FormGroup;
  destroyed$ = new Subject<void>();
  customer!: Customer;
  counter!: Counter;


  constructor(private readonly apiService: ApiService, private readonly store: Store, public dialog: MatDialog, private readonly router:Router) { }


  ngOnInit() {
    this.vertragForm = new FormGroup({
      vertragnummer: new FormControl(''),
      vertragstart: new FormControl(''),
      vertragsende: new FormControl(''),
      status: new FormControl('')
    });
  }
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  openDialog(type: string): void {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '100%'; // Definiere die Breite des Dialogfensters
    switch (type) {
      case PartTypes.CUSTOMER: {
        const dialogRef = this.dialog.open(CustomersDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
          this.customer = result;
        });
        break;
      }
      case PartTypes.COMPANY: {
        //statements; 
        break;
      }
      case PartTypes.COUNTER: {
        const dialogRef = this.dialog.open(CountersDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
          this.counter = result;
        });
        break;
        break;
      }
      default: {
        //statements; 
        break;
      }
    }

  }
  create() {
    if(!(this.customer && this.counter && this.customer._id)) return;
    this.apiService.addContract({
      kundennummer:this.customer._id,
      firma:"Test",
      status:ContractState.BEARBEITUNG,
      vertragnummer:this.vertragForm.get("vertragnummer")?.value,
      vertragstart: formatDate(this.vertragForm.get("vertragstart")?.value),
      vertragsende:formatDate(this.vertragForm.get("vertragsende")?.value),
      zaehlernummer:this.counter.zaehlernummer
    }).pipe(takeUntil(this.destroyed$)).subscribe({
      next: (contract) =>{
        this.store.dispatch(new AddContract(contract));
        this.router.navigate(['vertraege/view', contract.vertragnummer])
      },
      error: (error) => console.error(error),
      complete: () => console.log('Contract addition completed')
    })
    }
}

export function formatDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Verwenden Sie 24-Stunden-Format
  };

  const formatter = new Intl.DateTimeFormat('de-DE', options);
  const formattedDate = formatter.format(date);
  return formattedDate.replace(/\./g, ':').replace(/, /g, ', ');
}

export enum PartTypes {
  CUSTOMER = "customer",
  COMPANY = "company",
  COUNTER = "counter",
  TASK = "task"
}