import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TareasListComponent } from './tareas-list/tareas-list.component';

const routes: Routes = [{ path: '', component: TareasListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TareasRoutingModule { }
