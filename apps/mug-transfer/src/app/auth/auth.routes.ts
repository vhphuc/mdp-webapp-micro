import { Route } from '@angular/router';

export const authRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./auth.component').then(m => m.AuthComponent),
  },
];

export default authRoutes;
