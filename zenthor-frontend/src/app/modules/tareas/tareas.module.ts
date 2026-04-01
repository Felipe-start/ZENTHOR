import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TareasRoutingModule } from './tareas-routing.module';
import { TareasListComponent } from './tareas-list/tareas-list.component';

@NgModule({
  declarations: [TareasListComponent],
  imports: [CommonModule, RouterModule, TareasRoutingModule]
})
export class TareasModule { }
