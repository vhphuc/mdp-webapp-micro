import { Route } from '@angular/router';
import { PrintLeadResolver } from './util/resolver/print-lead-resolver';

export const printLeadRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./feature/print-lead.component').then(m => m.PrintLeadComponent),
    resolve: { factories: PrintLeadResolver },
  },
];

export default printLeadRoutes;
