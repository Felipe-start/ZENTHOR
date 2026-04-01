import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CalendarioRoutingModule } from './calendario-routing.module';
import { CalendarioComponent } from './calendario.component';

@NgModule({
  declarations: [CalendarioComponent],
  imports: [CommonModule, RouterModule, CalendarioRoutingModule]
})
export class CalendarioModule { }
