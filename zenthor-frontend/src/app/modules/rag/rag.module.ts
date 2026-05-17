import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { RagHubComponent } from './rag-hub/rag-hub.component';

const routes: Routes = [
  { path: '', component: RagHubComponent }
];

@NgModule({
  declarations: [RagHubComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class RagModule { }