import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VertraegeComponent } from './vertraege/vertraege.component';
import { KundenComponent } from './kunden/kunden.component';
import { TasksComponent } from './tasks/tasks.component';

const routes: Routes = [
  { path: 'vertraege', component: VertraegeComponent },
  { path: 'kunden', component: KundenComponent },
  { path: 'aufgaben', component: TasksComponent}  // usw. fÃ¼r Aufgaben und Firmen
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
