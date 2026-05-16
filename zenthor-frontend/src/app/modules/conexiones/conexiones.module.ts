import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ConexionesComponent } from './conexiones/conexiones.component';

const routes: Routes = [
  { path: '', component: ConexionesComponent }
];

@NgModule({
  declarations: [ConexionesComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ConexionesModule { }