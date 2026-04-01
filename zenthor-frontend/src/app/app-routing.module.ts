import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'materias',
    loadChildren: () => import('./modules/materias/materias.module').then(m => m.MateriasModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tareas',
    loadChildren: () => import('./modules/tareas/tareas.module').then(m => m.TareasModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'examenes',
    loadChildren: () => import('./modules/examenes/examenes.module').then(m => m.ExamenesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'calendario',
    loadChildren: () => import('./modules/calendario/calendario.module').then(m => m.CalendarioModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'configuracion',
    loadChildren: () => import('./modules/configuracion/configuracion.module').then(m => m.ConfiguracionModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }