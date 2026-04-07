import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TareasListComponent } from './tareas-list/tareas-list.component';
import { TareaFormComponent } from './tarea-form/tarea-form.component';

const routes: Routes = [
  { path: '', component: TareasListComponent },
  { path: 'nueva', component: TareaFormComponent },
  { path: 'editar/:id', component: TareaFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TareasRoutingModule { }