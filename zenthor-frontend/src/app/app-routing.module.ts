import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Auth module
  { 
    path: 'auth', 
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  
  // Dashboard
  { 
    path: 'dashboard', 
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard] 
  },
  
  // Materias
  { 
    path: 'materias', 
    loadChildren: () => import('./modules/materias/materias.module').then(m => m.MateriasModule),
    canActivate: [AuthGuard] 
  },
  
  // Tareas
  { 
    path: 'tareas', 
    loadChildren: () => import('./modules/tareas/tareas.module').then(m => m.TareasModule),
    canActivate: [AuthGuard] 
  },
  
  // Exámenes
  { 
    path: 'examenes', 
    loadChildren: () => import('./modules/examenes/examenes.module').then(m => m.ExamenesModule),
    canActivate: [AuthGuard] 
  },
  
  // Calendario
  { 
    path: 'calendario', 
    loadChildren: () => import('./modules/calendario/calendario.module').then(m => m.CalendarioModule),
    canActivate: [AuthGuard] 
  },
  
  // Configuración
  { 
    path: 'configuracion', 
    loadChildren: () => import('./modules/configuracion/configuracion.module').then(m => m.ConfiguracionModule),
    canActivate: [AuthGuard] 
  },
  
  // 🆕 CONEXIONES - Google Classroom, Notion, Teams, Moodle
  { 
    path: 'conexiones', 
    loadChildren: () => import('./modules/conexiones/conexiones.module').then(m => m.ConexionesModule),
    canActivate: [AuthGuard] 
  },
  
  // 🆕 RAG - Chat con IA y Documentos
  { 
    path: 'chat-ia', 
    loadChildren: () => import('./modules/rag/rag.module').then(m => m.RagModule),
    canActivate: [AuthGuard] 
  },
  
  // 🆕 Documentos vectorizados
  { 
    path: 'documentos', 
    loadChildren: () => import('./modules/rag/rag.module').then(m => m.RagModule),
    canActivate: [AuthGuard] 
  },
  
  // 🆕 Notificaciones - Email y WhatsApp
  { 
    path: 'notificaciones', 
    loadChildren: () => import('./modules/notificaciones/notificaciones.module').then(m => m.NotificacionesModule),
    canActivate: [AuthGuard] 
  },
  
  // Redirecciones
  { path: 'login', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: '/auth/register', pathMatch: 'full' },
  { path: 'forgot-password', redirectTo: '/auth/forgot-password', pathMatch: 'full' },
  { path: 'reset-password', redirectTo: '/auth/reset-password', pathMatch: 'full' },
  
  // 404
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false,
    enableTracing: false,
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }