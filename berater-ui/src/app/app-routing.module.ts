import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CustomersComponent } from './components/customers/customers.component';
import { MetersComponent } from './components/meters/meters.component';
import { ContractsComponent } from './components/contracts/contracts.component';
import { RemindersComponent } from './components/reminders/reminders.component';
import { MessagesComponent } from './components/messages/messages.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'customers',
        component: CustomersComponent
      },
      {
        path: 'meters',
        component: MetersComponent
      },
      {
        path: 'contracts',
        component: ContractsComponent
      },
      {
        path: 'reminders',
        component: RemindersComponent
      },
      {
        path: 'messages',
        component: MessagesComponent
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
