import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';  // ✅ AGREGAR
import { ConfiguracionRoutingModule } from './configuracion-routing.module';
import { ConfiguracionComponent } from './configuracion.component';
import { RecordatoriosComponent } from './recordatorios/recordatorios.component';  // ✅ AGREGAR

@NgModule({
  declarations: [
    ConfiguracionComponent,
    RecordatoriosComponent  // ✅ AGREGAR
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,  // ✅ AGREGAR
    ConfiguracionRoutingModule
  ]
})
export class ConfiguracionModule { }