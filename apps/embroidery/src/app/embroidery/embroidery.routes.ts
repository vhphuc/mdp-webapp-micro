import { Route } from '@angular/router';

export const routes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./embroidery.component').then(m => m.EmbroideryComponent),
  },
];

export default routes;
