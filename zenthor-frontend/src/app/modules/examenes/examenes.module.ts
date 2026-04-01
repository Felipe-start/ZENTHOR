import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamenesRoutingModule } from './examenes-routing.module';
import { ExamenesListComponent } from './examenes-list/examenes-list.component';

@NgModule({
  declarations: [ExamenesListComponent],
  imports: [CommonModule, RouterModule, ExamenesRoutingModule]
})
export class ExamenesModule { }
