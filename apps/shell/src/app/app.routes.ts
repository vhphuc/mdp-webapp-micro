import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/all-apps',
    pathMatch: 'full'
  },
  {
    path: 'all-apps',
    loadComponent: () => import('./all-apps/all-apps.component').then(m => m.AllAppsComponent)
  }
];