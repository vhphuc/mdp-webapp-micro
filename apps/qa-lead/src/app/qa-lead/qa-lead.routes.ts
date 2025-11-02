import { Route } from '@angular/router';

export const qaLeadRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./feature/qa-lead.component').then(m => m.QaLeadComponent),
  },
];

export default qaLeadRoutes;
