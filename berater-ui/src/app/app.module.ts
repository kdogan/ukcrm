import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CustomersComponent } from './components/customers/customers.component';
import { MetersComponent } from './components/meters/meters.component';
import { ContractsComponent } from './components/contracts/contracts.component';
import { RemindersComponent } from './components/reminders/reminders.component';
import { ViewportService } from './services/viewport.service';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    AppComponent,
    LoginComponent,
    LayoutComponent,
    DashboardComponent,
    CustomersComponent,
    MetersComponent,
    ContractsComponent,
    RemindersComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    ViewportService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
