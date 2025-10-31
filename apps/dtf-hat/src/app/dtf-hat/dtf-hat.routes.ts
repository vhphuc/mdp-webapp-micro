import { Route } from '@angular/router';

const routes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./dtf-hat.component').then(c => c.DtfHatComponent),
  },
];

export default routes;
