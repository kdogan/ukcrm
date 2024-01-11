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
import { VertragListComponent } from './vertrag-list/vertrag-list.component';
import { DividerComponent } from './elements/divider/divider.component';
import { BottomBtnComponent } from './elements/bottom-btn/bottom-btn.component';

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
    BottomBtnComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxsModule.forRoot([
      // Ihre States
    ]),
    NgxsLoggerPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
