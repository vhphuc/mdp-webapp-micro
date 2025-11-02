import { Route } from '@angular/router';

export const qaRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./feature/qa.component').then(m => m.QaComponent),
  },
];

export default qaRoutes;
