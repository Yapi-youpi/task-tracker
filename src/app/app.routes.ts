import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
    canActivate: [guestGuard],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@layout/layout.routes').then((m) => m.LAYOUT_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
