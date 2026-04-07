import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MateriasService } from '../../../core/services/materias.service';
import { TareasService } from '../../../core/services/tareas.service';
import { Materia } from '../../../core/models/materia.model';
import { TareaWithMateria } from '../../../core/models/tarea.model';

@Component({
  selector: 'app-materias-list',
  template: `
    <div class="materias-container">
      <div class="page-header">
        <div>
          <h1>Mis Materias</h1>
          <p>Gestiona todas tus materias académicas</p>
        </div>
        <button class="btn-primary" (click)="abrirFormulario()">
          <i class="fas fa-plus"></i>
          Nueva Materia
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando materias...</p>
      </div>

      <!-- Grid de materias -->
      <div *ngIf="!cargando" class="materias-grid">
        <div *ngIf="materias.length === 0" class="empty-state">
          <i class="fas fa-book-open"></i>
          <h3>No tienes materias registradas</h3>
          <p>Comienza agregando tu primera materia</p>
          <button class="btn-primary" (click)="abrirFormulario()">
            <i class="fas fa-plus"></i>
            Agregar Materia
          </button>
        </div>

        <div *ngFor="let materia of materias" class="materia-card" [style.borderTopColor]="materia.color || '#667eea'">
          <div class="materia-header">
            <div class="materia-info">
              <div class="materia-color" [style.backgroundColor]="materia.color || '#667eea'"></div>
              <h3>{{ materia.nombre }}</h3>
            </div>
            <div class="materia-actions">
              <button class="btn-icon" (click)="editarMateria(materia)" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon" (click)="eliminarMateria(materia.id)" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="materia-details" *ngIf="materia.profesor || materia.horario">
            <div class="detail-item" *ngIf="materia.profesor">
              <i class="fas fa-chalkboard-user"></i>
              <span>{{ materia.profesor }}</span>
            </div>
            <div class="detail-item" *ngIf="materia.horario">
              <i class="fas fa-clock"></i>
              <span>{{ materia.horario }}</span>
            </div>
          </div>

          <div class="materia-stats">
            <div class="stat" (click)="verTareas(materia.id)">
              <i class="fas fa-tasks"></i>
              <span>{{ obtenerTareasPendientes(materia.id) }} tareas pendientes</span>
            </div>
            <button class="btn-stats" (click)="verTareas(materia.id)">
              Ver tareas <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de formulario -->
    <div class="modal" [class.show]="mostrarModal" (click)="cerrarModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ materiaEditando ? 'Editar Materia' : 'Nueva Materia' }}</h2>
          <button class="close-btn" (click)="cerrarModal()">&times;</button>
        </div>
        <div class="modal-body">
          <form [formGroup]="materiaForm" (ngSubmit)="guardarMateria()">
            <div class="form-group">
              <label>Nombre de la materia *</label>
              <input type="text" formControlName="nombre" placeholder="Ej: Matemáticas">
              <div class="error" *ngIf="materiaForm.get('nombre')?.invalid && materiaForm.get('nombre')?.touched">
                El nombre es requerido
              </div>
            </div>

            <div class="form-group">
              <label>Profesor</label>
              <input type="text" formControlName="profesor" placeholder="Nombre del profesor">
            </div>

            <div class="form-group">
              <label>Horario</label>
              <input type="text" formControlName="horario" placeholder="Ej: Lunes y Miércoles 10:00 - 12:00">
            </div>

            <div class="form-group">
              <label>Color</label>
              <input type="color" formControlName="color" value="#667eea">
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="cerrarModal()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="materiaForm.invalid || guardando">
                {{ guardando ? 'Guardando...' : (materiaEditando ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .materias-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #2c3e50;
    }
    .page-header p {
      margin: 0;
      color: #718096;
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
    }
    .loading-container {
      text-align: center;
      padding: 60px;
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e0e0e0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .materias-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }
    .materia-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      border-top: 4px solid;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .materia-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .materia-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .materia-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .materia-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .materia-info h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c3e50;
    }
    .materia-actions {
      display: flex;
      gap: 8px;
    }
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      color: #95a5a6;
      transition: color 0.2s;
      padding: 4px;
    }
    .btn-icon:hover {
      color: #667eea;
    }
    .materia-details {
      margin: 16px 0;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 12px;
    }
    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #4a5568;
      margin-bottom: 8px;
    }
    .detail-item:last-child {
      margin-bottom: 0;
    }
    .materia-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eef2f6;
    }
    .stat {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #667eea;
      cursor: pointer;
    }
    .btn-stats {
      background: none;
      border: none;
      color: #667eea;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 20px;
    }
    .empty-state i {
      font-size: 64px;
      color: #cbd5e0;
      margin-bottom: 20px;
    }
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    .modal.show {
      display: flex;
    }
    .modal-content {
      background: white;
      border-radius: 24px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #eef2f6;
    }
    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #95a5a6;
    }
    .modal-body {
      padding: 24px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #2c3e50;
    }
    .form-group input {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 14px;
    }
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }
    .form-group input[type="color"] {
      height: 50px;
      cursor: pointer;
    }
    .error {
      color: #dc2626;
      font-size: 0.8rem;
      margin-top: 4px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    .btn-secondary {
      background: white;
      border: 2px solid #e0e0e0;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
    }
    @media (max-width: 768px) {
      .materias-grid {
        grid-template-columns: 1fr;
      }
      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }
    }
  `]
})
export class MateriasListComponent implements OnInit {
  materias: Materia[] = [];
  tareasPorMateria: Map<number, number> = new Map();
  cargando = true;
  mostrarModal = false;
  materiaEditando: Materia | null = null;
  guardando = false;
  materiaForm!: FormGroup;

  constructor(
    private materiasService: MateriasService,
    private tareasService: TareasService,
    private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarMaterias();
  }

  initForm() {
    this.materiaForm = this.fb.group({
      nombre: ['', Validators.required],
      profesor: [''],
      horario: [''],
      color: ['#667eea']
    });
  }

  cargarMaterias() {
    this.cargando = true;
    this.materiasService.getMateriasActivas().subscribe({
      next: (materias) => {
        this.materias = materias;
        this.cargarTareasPorMateria();
      },
      error: (error) => {
        console.error('Error cargando materias:', error);
        this.toastr.error('Error al cargar las materias');
        this.cargando = false;
      }
    });
  }

cargarTareasPorMateria() {
  this.tareasService.getTareas({ estado: 'pendiente' }).subscribe({
    next: (response: any) => {
      // Verificar si response es un array o tiene una propiedad data
      let tareas: any[] = [];
      if (Array.isArray(response)) {
        tareas = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        tareas = response.data;
      } else if (response && response.tareas && Array.isArray(response.tareas)) {
        tareas = response.tareas;
      } else {
        console.error('Formato de respuesta inesperado:', response);
        tareas = [];
      }
      
      // Contar tareas pendientes por materia
      this.tareasPorMateria.clear();
      tareas.forEach((tarea: any) => {
        const count = this.tareasPorMateria.get(tarea.materia_id) || 0;
        this.tareasPorMateria.set(tarea.materia_id, count + 1);
      });
      this.cargando = false;
    },
    error: (error: any) => {
      console.error('Error cargando tareas:', error);
      this.cargando = false;
    }
  });
}


  obtenerTareasPendientes(materiaId: number): number {
    return this.tareasPorMateria.get(materiaId) || 0;
  }

  abrirFormulario() {
    this.materiaEditando = null;
    this.materiaForm.reset({ color: '#667eea' });
    this.mostrarModal = true;
  }

  editarMateria(materia: Materia) {
    this.materiaEditando = materia;
    this.materiaForm.patchValue({
      nombre: materia.nombre,
      profesor: materia.profesor || '',
      horario: materia.horario || '',
      color: materia.color || '#667eea'
    });
    this.mostrarModal = true;
  }

  guardarMateria() {
    if (this.materiaForm.invalid) {
      this.toastr.warning('Por favor completa el nombre de la materia');
      return;
    }

    this.guardando = true;
    const materiaData = this.materiaForm.value;

    const request = this.materiaEditando
      ? this.materiasService.updateMateria(this.materiaEditando.id, materiaData)
      : this.materiasService.createMateria(materiaData);

    request.subscribe({
      next: () => {
        this.toastr.success(this.materiaEditando ? 'Materia actualizada' : 'Materia creada exitosamente');
        this.cerrarModal();
        this.cargarMaterias();
      },
      error: (error) => {
        this.toastr.error('Error al guardar la materia');
        this.guardando = false;
      }
    });
  }

  eliminarMateria(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta materia?')) {
      this.materiasService.deleteMateria(id).subscribe({
        next: () => {
          this.toastr.success('Materia eliminada correctamente');
          this.cargarMaterias();
        },
        error: (error) => {
          this.toastr.error('Error al eliminar la materia');
        }
      });
    }
  }

  verTareas(materiaId: number) {
    this.router.navigate(['/tareas'], { queryParams: { materia_id: materiaId } });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.materiaEditando = null;
  }
}