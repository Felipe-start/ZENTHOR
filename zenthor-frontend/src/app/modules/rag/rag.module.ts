import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { RagChatComponent } from './rag-chat/rag-chat.component';
import { DocumentosComponent } from './documentos/documentos.component';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

const routes: Routes = [
  { path: '', component: RagChatComponent },
  { path: 'documentos', component: DocumentosComponent }
];

@NgModule({
  declarations: [RagChatComponent, DocumentosComponent, MarkdownPipe],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class RagModule { }