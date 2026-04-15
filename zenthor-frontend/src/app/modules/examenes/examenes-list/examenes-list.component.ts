import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ExamenesService } from '../../../core/services/examenes.service';
import { ExamenWithMateria } from '../../../core/models/examen.model';

@Component({
  selector: 'app-examenes-list',
  templateUrl: './examenes-list.component.html',
  styleUrls: ['./examenes-list.component.css'],
  standalone: false
})
export class ExamenesListComponent implements OnInit {
  examenes: ExamenWithMateria[] = [];
  cargando = true;

  constructor(
    private examenesService: ExamenesService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarExamenes();
  }

  cargarExamenes(): void {
    this.cargando = true;
    this.examenesService.getExamenes().subscribe({
      next: (data) => {
        this.examenes = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error al cargar los exámenes');
        this.cargando = false;
      }
    });
  }

  nuevoExamen(): void {
    this.router.navigate(['/examenes/nuevo']);
  }

  editarExamen(id: number): void {
    this.router.navigate([`/examenes/editar/${id}`]);
  }

  eliminarExamen(id: number): void {
    if (confirm('¿Estás seguro de eliminar este examen?')) {
      this.examenesService.deleteExamen(id).subscribe({
        next: () => {
          this.toastr.success('Examen eliminado correctamente');
          this.cargarExamenes();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al eliminar el examen');
        }
      });
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
