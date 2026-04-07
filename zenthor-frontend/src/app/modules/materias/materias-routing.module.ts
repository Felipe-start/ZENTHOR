import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MateriasListComponent } from './materias-list/materias-list.component';

const routes: Routes = [
  { path: '', component: MateriasListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MateriasRoutingModule { }