import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { KundenComponent } from './pages/kunden/kunden.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { DividerComponent } from './elements/divider/divider.component';
import { BottomBtnComponent } from './elements/bottom-btn/bottom-btn.component';
import { BreadcrumbComponent } from './elements/breadcrumb/breadcrumb.component';
import { CustomersState } from './core/store/customers.state';
import { ContractsState } from './core/store/contracts.state';
import { AddressComponent } from './elements/address/address.component';
import { CounterListComponent } from './pages/counters/counter-list/counter-list.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { CountersComponent } from './pages/counters/counters.component';
import { AllCountersComponent } from './pages/counters/all-counters/all-counters.component';
import { CountersState } from './core/store/counters.state';
import { SucherComponent } from './elements/sucher/sucher.component';
import { TasksListComponent } from './pages/tasks/tasks-list/tasks-list.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { AllVertraegeComponent } from './pages/vertraege/all-vertraege/all-vertraege.component';
import { VertraegeComponent } from './pages/vertraege/vertraege.component';
import { VertragListComponent } from './pages/vertraege/vertrag-list/vertrag-list.component';
import { VertragComponent } from './pages/vertraege/vertrag/vertrag.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateCounterComponent } from './pages/counters/create-counter/create-counter.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AddressFormComponent } from './forms/address-form/address-form.component';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';
import { UserState } from './core/store/user.state';
import { CreateVertragComponent } from './pages/vertraege/create-vertrag/create-vertrag.component';
import { TasksState } from './core/store/tasks.state';
import { CreateCustomerComponent } from './pages/kunden/create-customer/create-customer.component';
import { AllCustomersComponent } from './pages/kunden/all-customers/all-customers.component';
import { CustomerListComponent } from './pages/kunden/customer-list/customer-list.component';
import { CustomerComponent } from './pages/kunden/customer/customer.component';
import { MatCardModule } from '@angular/material/card';
import { NoteFormComponent } from './forms/note-form/note-form.component';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CustomersDialogComponent } from './dialogs/customers-dialog/customers-dialog.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    KundenComponent,
    VertraegeComponent,
    TasksComponent,
    TasksListComponent,
    DashboardComponent,
    VertragListComponent,
    DividerComponent,
    BottomBtnComponent,
    BreadcrumbComponent,
    VertragComponent,
    AllVertraegeComponent,
    AddressComponent,
    CounterListComponent,
    CountersComponent,
    AllCountersComponent,
    SucherComponent,
    CreateCounterComponent,
    AddressComponent,
    AddressFormComponent,
    CreateVertragComponent,
    CreateCustomerComponent,
    AllCustomersComponent,
    CustomerListComponent,
    CustomerComponent,
    NoteFormComponent,
    CustomersDialogComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    NgxsModule.forRoot([
      CustomersState, ContractsState, CountersState, UserState, TasksState
    ]),
    NgxsLoggerPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    MatMenuModule,
    MatButtonModule, 
    MatIconModule,
    MatTableModule, 
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatNativeDateModule,
    MatDatepickerModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
