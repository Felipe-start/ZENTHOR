import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConfiguracionRoutingModule } from './configuracion-routing.module';
import { ConfiguracionComponent } from './configuracion.component';

@NgModule({
  declarations: [ConfiguracionComponent],
  imports: [CommonModule, RouterModule, ConfiguracionRoutingModule]
})
export class ConfiguracionModule { }
