import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { KundenComponent } from './kunden/kunden.component';
import { VertraegeComponent } from './vertraege/vertraege.component';
import { TasksComponent } from './tasks/tasks.component';
import { TasksListComponent } from './tasks-list/tasks-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { VertragListComponent } from './vertraege/vertrag-list/vertrag-list.component';
import { DividerComponent } from './elements/divider/divider.component';
import { BottomBtnComponent } from './elements/bottom-btn/bottom-btn.component';
import { BreadcrumbComponent } from './elements/breadcrumb/breadcrumb.component';
import { VertragComponent } from './vertraege/vertrag/vertrag.component';
import { AllVertraegeComponent } from './vertraege/all-vertraege/all-vertraege.component';
import { CustomersState } from './core/store/customers.state';
import { ContractsState } from './core/store/contracts.state';
import { AddressComponent } from './elements/address/address.component';
import { CounterListComponent } from './counter-list/counter-list.component';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
    CounterListComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    NgxsModule.forRoot([
      CustomersState, ContractsState
    ]),
    NgxsLoggerPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    MatMenuModule,
    MatButtonModule, 
    MatIconModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
