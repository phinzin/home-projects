import { Route } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { Home } from './pages/home/home';

export const appRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: Home
      }
    ],
  },
];
