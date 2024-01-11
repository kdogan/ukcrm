import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VertraegeComponent } from './vertraege/vertraege.component';
import { KundenComponent } from './kunden/kunden.component';
import { TasksComponent } from './tasks/tasks.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, 
  { path: 'dashboard', component: DashboardComponent }, 
  { path: 'vertraege', component: VertraegeComponent },
  { path: 'kunden', component: KundenComponent },
  { path: 'aufgaben', component: TasksComponent}
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
