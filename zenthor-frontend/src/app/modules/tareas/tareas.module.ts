import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TareasRoutingModule } from './tareas-routing.module';
import { TareasListComponent } from './tareas-list/tareas-list.component';
import { TareaFormComponent } from './tarea-form/tarea-form.component';
import { TareaCardComponent } from './tarea-card/tarea-card.component';

@NgModule({
  declarations: [
    TareasListComponent,
    TareaFormComponent,
    TareaCardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TareasRoutingModule
  ],
  exports: [
    TareaCardComponent
  ]
})
export class TareasModule { }