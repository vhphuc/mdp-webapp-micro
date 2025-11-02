import { Route } from '@angular/router';

export const neckLabelRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./feature/neck-label.component').then(m => m.NeckLabelComponent),
  },
];

export default neckLabelRoutes;
