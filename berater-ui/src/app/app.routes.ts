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
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./components/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
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
        path: 'customers/:id',
        loadComponent: () => import('./components/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'contracts',
        loadComponent: () => import('./components/contracts/contracts.component').then(m => m.ContractsComponent)
      },
      {
        path: 'contracts/:id',
        loadComponent: () => import('./components/contracts/contracts.component').then(m => m.ContractsComponent)
      },
      {
        path: 'meters',
        loadComponent: () => import('./components/meters/meters.component').then(m => m.MetersComponent)
      },
      {
        path: 'meters/:id',
        loadComponent: () => import('./components/meters/meters.component').then(m => m.MetersComponent)
      },
      {
        path: 'reminders',
        loadComponent: () => import('./components/reminders/reminders.component').then(m => m.RemindersComponent)
      },
      {
        path: 'todos',
        loadComponent: () => import('./components/todos/todos.component').then(m => m.TodosComponent)
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./components/suppliers/suppliers.component').then(m => m.SuppliersComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent)
      },
      {
        path: 'packages',
        loadComponent: () => import('./components/packages/packages.component').then(m => m.PackagesComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent)
      }
      // Messages temporarily disabled for performance
      // {
      //   path: 'messages',
      //   loadComponent: () => import('./components/messages/messages.component').then(m => m.MessagesComponent)
      // }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
