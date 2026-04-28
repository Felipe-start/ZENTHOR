import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfiguracionComponent } from './configuracion.component';
import { RecordatoriosComponent } from './recordatorios/recordatorios.component';

const routes: Routes = [
  { path: '', component: ConfiguracionComponent },
  { path: 'recordatorios', component: RecordatoriosComponent }  // ✅ AGREGAR
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfiguracionRoutingModule { }