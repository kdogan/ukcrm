import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VertraegeComponent } from './vertraege/vertraege.component';
import { KundenComponent } from './kunden/kunden.component';
import { TasksComponent } from './tasks/tasks.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VertragComponent } from './vertrag/vertrag.component';
import { AllVertraegeComponent } from './all-vertraege/all-vertraege.component';

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
                component: AllVertraegeComponent
              },
              {
                path: 'view/:vertragnummer',
                component: VertragComponent
              }
            ]},
  { path: 'kunden', component: KundenComponent, data: { breadcrumb: 'Kunden' }  },
  { path: 'aufgaben', component: TasksComponent, data: { breadcrumb: 'Aufgaben' } }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
