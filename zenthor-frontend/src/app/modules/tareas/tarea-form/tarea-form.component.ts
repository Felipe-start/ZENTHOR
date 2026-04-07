import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TareasService } from '../../../core/services/tareas.service';
import { MateriasService } from '../../../core/services/materias.service';
import { Materia } from '../../../core/models/materia.model';
import { Tarea } from '../../../core/models/tarea.model';

@Component({
  selector: 'app-tarea-form',
  template: `
    <div class="form-container">
      <div class="form-card">
        <div class="form-header">
          <h1>{{ esEdicion ? 'Editar Tarea' : 'Nueva Tarea' }}</h1>
          <p>{{ esEdicion ? 'Modifica los datos de tu tarea' : 'Registra una nueva tarea académica' }}</p>
        </div>

        <form [formGroup]="tareaForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="titulo">Título *</label>
            <input
              type="text"
              id="titulo"
              formControlName="titulo"
              placeholder="Ej: Entregar proyecto final"
              [class.is-invalid]="tareaForm.get('titulo')?.invalid && tareaForm.get('titulo')?.touched"
            >
            <div class="error-message" *ngIf="tareaForm.get('titulo')?.invalid && tareaForm.get('titulo')?.touched">
              El título es requerido (mínimo 3 caracteres)
            </div>
          </div>

          <div class="form-group">
            <label for="materia_id">Materia *</label>
            <select id="materia_id" formControlName="materia_id" [class.is-invalid]="tareaForm.get('materia_id')?.invalid && tareaForm.get('materia_id')?.touched">
              <option [value]="">Selecciona una materia</option>
              <option *ngFor="let materia of materias" [value]="materia.id">
                {{ materia.nombre }}
              </option>
            </select>
            <div class="error-message" *ngIf="tareaForm.get('materia_id')?.invalid && tareaForm.get('materia_id')?.touched">
              Selecciona una materia
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="fecha_entrega">Fecha de entrega *</label>
              <input
                type="datetime-local"
                id="fecha_entrega"
                formControlName="fecha_entrega"
                [class.is-invalid]="tareaForm.get('fecha_entrega')?.invalid && tareaForm.get('fecha_entrega')?.touched"
              >
              <div class="error-message" *ngIf="tareaForm.get('fecha_entrega')?.invalid && tareaForm.get('fecha_entrega')?.touched">
                La fecha de entrega es requerida
              </div>
            </div>

            <div class="form-group">
              <label for="prioridad">Prioridad</label>
              <select id="prioridad" formControlName="prioridad">
                <option value="baja">🟢 Baja</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🔴 Alta</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción (opcional)</label>
            <textarea
              id="descripcion"
              formControlName="descripcion"
              rows="4"
              placeholder="Describe los detalles de la tarea..."
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" routerLink="/tareas">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" [disabled]="tareaForm.invalid || isLoading">
              <span *ngIf="!isLoading">{{ esEdicion ? 'Actualizar' : 'Crear' }} Tarea</span>
              <span *ngIf="isLoading" class="spinner"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .form-card {
      background: white;
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .form-header {
      margin-bottom: 32px;
      text-align: center;
    }
    .form-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 8px 0;
    }
    .form-header p {
      color: #718096;
      margin: 0;
    }
    .form-group {
      margin-bottom: 24px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #2c3e50;
    }
    input, select, textarea {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #667eea;
    }
    input.is-invalid, select.is-invalid, textarea.is-invalid {
      border-color: #dc2626;
    }
    .error-message {
      color: #dc2626;
      font-size: 0.8rem;
      margin-top: 6px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #eef2f6;
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      padding: 12px 28px;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: white;
      border: 2px solid #e0e0e0;
      padding: 12px 28px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      background: #f8f9fa;
    }
    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid white;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
      .form-card {
        padding: 20px;
      }
    }
  `]
})
export class TareaFormComponent implements OnInit {
  tareaForm: FormGroup;
  materias: Materia[] = [];
  esEdicion = false;
  tareaId?: number;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private tareasService: TareasService,
    private materiasService: MateriasService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.tareaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      materia_id: ['', [Validators.required]],
      fecha_entrega: ['', [Validators.required]],
      prioridad: ['media'],
      descripcion: ['']
    });
  }

  ngOnInit() {
    this.cargarMaterias();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.esEdicion = true;
        this.tareaId = parseInt(params['id']);
        this.cargarTarea();
      }
    });
  }

  cargarMaterias() {
    this.materiasService.getMateriasActivas().subscribe({
      next: (materias) => {
        this.materias = materias;
      },
      error: () => {
        this.toastr.error('Error al cargar las materias');
      }
    });
  }

  cargarTarea() {
    if (!this.tareaId) return;
    
    this.tareasService.getTareaById(this.tareaId).subscribe({
      next: (tarea) => {
        this.tareaForm.patchValue({
          titulo: tarea.titulo,
          materia_id: tarea.materia_id,
          fecha_entrega: this.formatDateForInput(tarea.fecha_entrega),
          prioridad: tarea.prioridad,
          descripcion: tarea.descripcion
        });
      },
      error: () => {
        this.toastr.error('Error al cargar la tarea');
        this.router.navigate(['/tareas']);
      }
    });
  }

  formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  onSubmit() {
    if (this.tareaForm.invalid) {
      this.toastr.warning('Por favor completa los campos requeridos');
      return;
    }

    this.isLoading = true;
    const tareaData = this.tareaForm.value;

    const request = this.esEdicion && this.tareaId
      ? this.tareasService.updateTarea(this.tareaId, tareaData)
      : this.tareasService.createTarea(tareaData);

    request.subscribe({
      next: () => {
        this.toastr.success(this.esEdicion ? 'Tarea actualizada' : 'Tarea creada exitosamente');
        this.router.navigate(['/tareas']);
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al guardar la tarea');
        this.isLoading = false;
      }
    });
  }
}