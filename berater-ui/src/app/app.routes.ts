import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LayoutComponent } from './components/layout/layout.component';

// Auth Guard
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./components/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'contracts',
        loadComponent: () => import('./components/contracts/contracts.component').then(m => m.ContractsComponent)
      },
      {
        path: 'meters',
        loadComponent: () => import('./components/meters/meters.component').then(m => m.MetersComponent)
      },
      {
        path: 'reminders',
        loadComponent: () => import('./components/reminders/reminders.component').then(m => m.RemindersComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
