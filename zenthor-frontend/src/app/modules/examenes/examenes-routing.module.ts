import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExamenesListComponent } from './examenes-list/examenes-list.component';
import { ExamenFormComponent } from './examen-form/examen-form.component';

const routes: Routes = [
  { path: '', component: ExamenesListComponent },
  { path: 'nuevo', component: ExamenFormComponent },
  { path: 'editar/:id', component: ExamenFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExamenesRoutingModule { }
