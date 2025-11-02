import { Route } from '@angular/router';

export const trimRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./feature/trim.component').then(m => m.TrimComponent),
  },
];

export default trimRoutes;
