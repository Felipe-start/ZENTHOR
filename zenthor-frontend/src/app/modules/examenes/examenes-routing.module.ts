import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExamenesListComponent } from './examenes-list/examenes-list.component';

const routes: Routes = [{ path: '', component: ExamenesListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExamenesRoutingModule { }
