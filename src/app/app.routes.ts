import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/issues/issues.component').then((m) => m.IssuesComponent),
    pathMatch: 'full'
  },
];
