import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ExamenesService } from '../../../core/services/examenes.service';
import { MateriasService } from '../../../core/services/materias.service';
import { Materia } from '../../../core/models/materia.model';

@Component({
  selector: 'app-examen-form',
  templateUrl: './examen-form.component.html',
  styleUrls: ['./examen-form.component.css'],
  standalone: false
})
export class ExamenFormComponent implements OnInit {
  examenForm: FormGroup;
  materias: Materia[] = [];
  cargando = false;
  esEdicion = false;
  examenId?: number;

  constructor(
    private fb: FormBuilder,
    private examenesService: ExamenesService,
    private materiasService: MateriasService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.examenForm = this.fb.group({
      materia_id: ['', Validators.required],
      fecha_examen: ['', Validators.required],
      aula: [''],
      temas: ['']
    });
  }

  ngOnInit(): void {
    this.cargarMaterias();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.esEdicion = true;
      this.examenId = +id;
      this.cargarExamen();
    }
  }

  cargarMaterias(): void {
    this.materiasService.getMateriasActivas().subscribe({
      next: (data) => {
        this.materias = data;
      },
      error: () => this.toastr.error('Error al cargar materias')
    });
  }

  cargarExamen(): void {
    if (!this.examenId) return;
    this.examenesService.getExamenById(this.examenId).subscribe({
      next: (examen) => {
        this.examenForm.patchValue({
          materia_id: examen.materia_id,
          fecha_examen: examen.fecha_examen.slice(0, 16),
          aula: examen.aula,
          temas: examen.temas
        });
      },
      error: () => this.toastr.error('Error al cargar el examen')
    });
  }

  guardar(): void {
    if (this.examenForm.invalid) {
      this.toastr.warning('Completa todos los campos obligatorios');
      return;
    }

    this.cargando = true;
    const formValue = this.examenForm.value;

    if (this.esEdicion && this.examenId) {
      this.examenesService.updateExamen(this.examenId, formValue).subscribe({
        next: () => {
          this.toastr.success('Examen actualizado');
          this.router.navigate(['/examenes']);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al actualizar');
          this.cargando = false;
        }
      });
    } else {
      this.examenesService.createExamen(formValue).subscribe({
        next: () => {
          this.toastr.success('Examen creado');
          this.router.navigate(['/examenes']);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al crear');
          this.cargando = false;
        }
      });
    }
  }
}
