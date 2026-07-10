import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/login/login.component';
import { HomeRedirectComponent } from './features/home-redirect.component';
import { EmployeeDashboardComponent } from './features/employee-dashboard/employee-dashboard.component';
import { ManagerDashboardComponent } from './features/manager-dashboard/manager-dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeRedirectComponent, canActivate: [authGuard] },
  {
    path: 'employee',
    component: EmployeeDashboardComponent,
    canActivate: [authGuard, roleGuard('employee')]
  },
  {
    path: 'manager',
    component: ManagerDashboardComponent,
    canActivate: [authGuard, roleGuard('manager')]
  },
  { path: '**', redirectTo: '' }
];
