import { Component, OnInit } from '@angular/core';
import { RagService, DocumentoVector } from '../../../core/services/rag.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.css']
})
export class DocumentosComponent implements OnInit {
  documentos: DocumentoVector[] = [];
  cargando = false;
  subiendo = false;
  archivoSeleccionado: File | null = null;
  tituloDocumento = '';
  fuenteDocumento = 'subida_manual';

  constructor(
    private ragService: RagService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  cargarDocumentos(): void {
    this.cargando = true;
    this.ragService.obtenerDocumentos().subscribe({
      next: (docs) => {
        this.documentos = docs;
        this.cargando = false;
      },
      error: () => {
        this.toastr.error('Error al cargar documentos');
        this.cargando = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        this.toastr.error('Solo se permiten PDF, DOCX y TXT');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.toastr.error('El archivo no puede superar los 10MB');
        return;
      }
      this.archivoSeleccionado = file;
      this.tituloDocumento = file.name.replace(/\.[^/.]+$/, '');
    }
  }

  subirDocumento(): void {
    if (!this.archivoSeleccionado) {
      this.toastr.warning('Selecciona un archivo primero');
      return;
    }

    this.subiendo = true;
    this.ragService.subirDocumento(this.archivoSeleccionado, this.tituloDocumento, this.fuenteDocumento).subscribe({
      next: () => {
        this.toastr.success('Documento subido y vectorizado correctamente');
        this.subiendo = false;
        this.archivoSeleccionado = null;
        this.tituloDocumento = '';
        this.cargarDocumentos();
        // Resetear input file
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (err) => {
        this.toastr.error(err.error?.error || 'Error al subir documento');
        this.subiendo = false;
      }
    });
  }

  eliminarDocumento(id: string, titulo: string): void {
    if (confirm(`¿Eliminar "${titulo}"?`)) {
      this.ragService.eliminarDocumento(id).subscribe({
        next: () => {
          this.toastr.success('Documento eliminado');
          this.cargarDocumentos();
        },
        error: () => {
          this.toastr.error('Error al eliminar');
        }
      });
    }
  }

  cancelarSubida(): void {
    this.archivoSeleccionado = null;
    this.tituloDocumento = '';
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}