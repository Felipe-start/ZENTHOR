import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MateriasRoutingModule } from './materias-routing.module';
import { MateriasListComponent } from './materias-list/materias-list.component';

@NgModule({
  declarations: [MateriasListComponent],
  imports: [CommonModule, RouterModule, MateriasRoutingModule]
})
export class MateriasModule { }
