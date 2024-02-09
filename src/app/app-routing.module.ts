import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KundenComponent } from './pages/kunden/kunden.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CountersComponent } from './pages/counters/counters.component';
import { AllCountersComponent } from './pages/counters/all-counters/all-counters.component';
import { VertraegeComponent } from './pages/vertraege/vertraege.component';
import { CreateCounterComponent } from './pages/counters/create-counter/create-counter.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { AllVertraegeComponent } from './pages/vertraege/all-vertraege/all-vertraege.component';
import { VertragComponent } from './pages/vertraege/vertrag/vertrag.component';
import { CreateVertragComponent } from './pages/vertraege/create-vertrag/create-vertrag.component';
import { AllCustomersComponent } from './pages/kunden/all-customers/all-customers.component';
import { CustomerComponent } from './pages/kunden/customer/customer.component';
import { CreateCustomerComponent } from './pages/kunden/create-customer/create-customer.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, 
  { path: 'dashboard', component: DashboardComponent, data: { breadcrumb: 'Dashboard' } }, 
  { path: 'vertraege',
    component: VertraegeComponent, 
    data: { breadcrumb: 'Verträge' },
    children: [
      {
        path: '',
        redirectTo: 'all',
        pathMatch: 'full'
      },
      {
        path: 'all',
        component: AllVertraegeComponent,
        data: { breadcrumb: 'Alle Verträge' }
      },
      {
        path: 'view/:vertragnummer',
        component: VertragComponent,
        data: { breadcrumb: 'Vertrag' }
      },
      {
        path: 'add',
        component: CreateVertragComponent,
        data: { breadcrumb: 'Vertrag erzeugen' }
      },
    ]
  },
  { path: 'kunden', component: KundenComponent, 
    data: { breadcrumb: 'Kunden' },
    children: [
      {
        path: '',
        redirectTo: 'all',
        pathMatch: 'full'
      },
      {
        path: 'all',
        component: AllCustomersComponent,
        data: { breadcrumb: 'Alle Kunden' }
      },
      {
        path: 'view',
        component: CustomerComponent,
        data: { breadcrumb: 'Kunde' }
      },
      {
        path: 'add',
        component: CreateCustomerComponent,
        data: { breadcrumb: 'Kunden anlegen' }
      },
    ]
  },
  { path: 'aufgaben', component: TasksComponent, data: { breadcrumb: 'Aufgaben' } },
  { path: 'zaehler',
    component:CountersComponent,
    data: {breadcrumb: 'Zähler'},
    children: [
      {
        path: '',
        redirectTo: 'all',
        pathMatch: 'full'
      },
      {
        path: 'all',
        component: AllCountersComponent,
        data: { breadcrumb: 'Alle Zähler' }
      },
      {
        path: 'view/:zählernummer',
        component: VertraegeComponent,
        data: { breadcrumb: 'Zähler' }
      },
      {
        path: 'create',
        component: CreateCounterComponent,
        data: { breadcrumb: 'Zähler erstellen' }
      },
    ]
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
