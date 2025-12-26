import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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
import { MessagesComponent } from './components/messages/messages.component';
import { MessagesMobileComponent } from './components/messages/messages-mobile/messages-mobile.component';
import { TableContainerComponent } from './components/shared/tablecontainer.component';
import { RegisterComponent } from './components/register/register.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AdminComponent } from './components/admin/admin.component';
import { PackagesComponent } from './components/packages/packages.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { TodoComponent } from './components/todos/todo.component';
import { TodosComponent } from './components/todos/todos.component';
import { ContractsMobileComponent } from './components/contracts/mobile/contracts-mobile/contracts-mobile.component';
import { CustomersMobileComponent } from './components/customers/mobile/customers-mobile/customers-mobile.component';
import { MetersMobileComponent } from './components/meters/mobile/meters-mobile.component';
import { SuppliersMobileComponent } from './components/suppliers/mobile/suppliers-mobile.component';
import { OverlayModalComponent } from './components/shared/overlay-modal.component';

@NgModule({
  declarations: [
    // All non-standalone components
    AppComponent,
    LoginComponent,
    RegisterComponent,
    VerifyEmailComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    LayoutComponent,
    DashboardComponent,
    CustomersComponent,
    MetersComponent,
    ContractsComponent,
    RemindersComponent,
    MessagesComponent,
    MessagesMobileComponent,
    AdminComponent,
    PackagesComponent,
    SettingsComponent,
    SuppliersComponent,
    TodoComponent,
    TodosComponent,
    ContractsMobileComponent,
    CustomersMobileComponent,
    MetersMobileComponent,
    SuppliersMobileComponent,
    OverlayModalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    // Standalone components only
    TableContainerComponent
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
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
