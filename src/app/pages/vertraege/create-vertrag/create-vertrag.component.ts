import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from '../../../core/service/api.service';
import { Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';
import { AddContract } from '../../../core/store/contract.action';
import { Contract, Customer } from '../../../core/models';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CustomersDialogComponent } from '../../../dialogs/customers-dialog/customers-dialog.component';

@Component({
  selector: 'app-create-vertrag',
  templateUrl: './create-vertrag.component.html',
  styleUrl: './create-vertrag.component.scss'
})
export class CreateVertragComponent implements OnInit, OnDestroy {
  vertragForm!: FormGroup;
  destroyed$ = new Subject<void>();
  customer!: Customer;


  constructor(private readonly apiService: ApiService, private readonly store: Store, public dialog: MatDialog) { }


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
      default: {
        //statements; 
        break;
      }
    }

  }

  onSubmit() {
    this.apiService.addContract(this.vertragForm.value).pipe(takeUntil(this.destroyed$)).subscribe({
      next: (c: Contract) => this.store.dispatch(new AddContract(c))
    })
  }
}

export enum PartTypes {
  CUSTOMER = "customer",
  COMPANY = "company",
  COUNTER = "counter",
  TASK = "task"
}