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
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
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
    SucherComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    NgxsModule.forRoot([
      CustomersState, ContractsState, CountersState
    ]),
    NgxsLoggerPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    MatMenuModule,
    MatButtonModule, 
    MatIconModule,
    MatTableModule, 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
