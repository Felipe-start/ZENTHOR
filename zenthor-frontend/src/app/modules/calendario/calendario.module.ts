import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarioRoutingModule } from './calendario-routing.module';
import { CalendarioComponent } from './calendario/calendario.component';

@NgModule({
  declarations: [CalendarioComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FullCalendarModule,
    CalendarioRoutingModule
  ]
})
export class CalendarioModule { }