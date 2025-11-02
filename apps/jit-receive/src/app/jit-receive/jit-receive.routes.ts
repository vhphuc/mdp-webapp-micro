import { Route } from '@angular/router';

const routes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./jit-receive.component').then(c => c.JitReceiveComponent),
  },
];

export default routes;
