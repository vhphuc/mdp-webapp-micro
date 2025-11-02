import { Route } from '@angular/router';

export const mugTransferRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./feature/mug.component').then(m => m.MugComponent),
  },
];

export default mugTransferRoutes;
