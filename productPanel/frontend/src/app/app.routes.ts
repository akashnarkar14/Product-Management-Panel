import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login').then(m => m.Login) },
  {
    path: 'app',
    loadComponent: () => import('./components/layout/layout').then(m => m.Layout),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'categories', loadComponent: () => import('./components/categories/categories').then(m => m.Categories) },
      { path: 'products', loadComponent: () => import('./components/products/products').then(m => m.Products) },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
