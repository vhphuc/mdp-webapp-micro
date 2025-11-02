import { Route } from '@angular/router';
import { WashingResolver } from './ui/resolver/washing-resolver';

export const washingRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./feature/washing.component').then(m => m.WashingComponent),
    resolve: { factories: WashingResolver },
  },
];

export default washingRoutes;
