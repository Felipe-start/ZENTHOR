import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ExamenesRoutingModule } from './examenes-routing.module';
import { ExamenesListComponent } from './examenes-list/examenes-list.component';
import { ExamenFormComponent } from './examen-form/examen-form.component';

@NgModule({
  declarations: [ExamenesListComponent, ExamenFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ExamenesRoutingModule
  ]
})
export class ExamenesModule { }
