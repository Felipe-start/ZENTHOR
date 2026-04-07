import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MateriasRoutingModule } from './materias-routing.module';
import { MateriasListComponent } from './materias-list/materias-list.component';

@NgModule({
  declarations: [
    MateriasListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MateriasRoutingModule
  ]
})
export class MateriasModule { }