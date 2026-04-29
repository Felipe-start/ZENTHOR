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
        <div class="header-title">
          <h1>Mis Materias</h1>
          <p>Gestiona todas tus materias académicas</p>
        </div>
        <button class="btn-primary" (click)="abrirFormulario()">
          <i class="fas fa-plus"></i>
          <span>Nueva Materia</span>
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
              <input type="text" formControlName="nombre" placeholder="Ej: Matemáticas" [class.is-invalid]="materiaForm.get('nombre')?.invalid && materiaForm.get('nombre')?.touched">
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
    /* ============================================
       MATERIAS-LIST - Fully Responsive Styles
       ============================================ */
    
    .materias-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: clamp(0.75rem, 4vw, 1.25rem);
    }
    
    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: clamp(1.5rem, 5vw, 2rem);
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .header-title h1 {
      font-size: clamp(1.25rem, 5vw, 2rem);
      font-weight: 700;
      margin: 0 0 0.25rem 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .header-title p {
      margin: 0;
      color: #718096;
      font-size: clamp(0.75rem, 3vw, 0.875rem);
    }
    
    /* Botón Primario */
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      padding: clamp(0.625rem, 2.5vw, 0.75rem) clamp(1rem, 4vw, 1.5rem);
      border-radius: clamp(0.75rem, 3vw, 1rem);
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: clamp(0.75rem, 3vw, 0.875rem);
      min-height: 44px;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
    
    /* Loading */
    .loading-container {
      text-align: center;
      padding: clamp(2rem, 10vw, 3.75rem);
    }
    
    .spinner {
      width: clamp(2rem, 8vw, 3rem);
      height: clamp(2rem, 8vw, 3rem);
      border: 4px solid #e0e0e0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Grid de materias - Responsive */
    .materias-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
      gap: clamp(1rem, 4vw, 1.5rem);
    }
    
    /* Materia Card */
    .materia-card {
      background: white;
      border-radius: clamp(1rem, 4vw, 1.25rem);
      padding: clamp(1rem, 4vw, 1.25rem);
      border-top: 4px solid;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .materia-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.12);
    }
    
    .materia-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .materia-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      min-width: 0;
    }
    
    .materia-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    
    .materia-info h3 {
      margin: 0;
      font-size: clamp(1rem, 4vw, 1.1rem);
      font-weight: 600;
      color: #2c3e50;
      word-break: break-word;
    }
    
    .materia-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }
    
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      color: #95a5a6;
      transition: all 0.2s;
      padding: 0.5rem;
      border-radius: 0.5rem;
      min-width: 36px;
      min-height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-icon:hover {
      background: #f0f0f0;
      color: #667eea;
    }
    
    /* Materia Details */
    .materia-details {
      margin: 1rem 0;
      padding: clamp(0.75rem, 3vw, 1rem);
      background: #f8f9fa;
      border-radius: clamp(0.75rem, 3vw, 1rem);
    }
    
    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: clamp(0.75rem, 3vw, 0.85rem);
      color: #4a5568;
      margin-bottom: 0.5rem;
    }
    
    .detail-item:last-child {
      margin-bottom: 0;
    }
    
    .detail-item i {
      width: 1.25rem;
      flex-shrink: 0;
    }
    
    .detail-item span {
      word-break: break-word;
    }
    
    /* Materia Stats */
    .materia-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eef2f6;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    
    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: clamp(0.75rem, 3vw, 0.85rem);
      color: #667eea;
      cursor: pointer;
      padding: 0.25rem 0;
    }
    
    .stat i {
      font-size: 1rem;
    }
    
    .btn-stats {
      background: none;
      border: none;
      color: #667eea;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 0.75rem;
      border-radius: 2rem;
      transition: all 0.2s;
      font-size: clamp(0.75rem, 3vw, 0.85rem);
    }
    
    .btn-stats:hover {
      background: #f0f4ff;
    }
    
    /* Empty State */
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: clamp(2rem, 10vw, 3.75rem);
      background: white;
      border-radius: clamp(1rem, 5vw, 1.5rem);
    }
    
    .empty-state i {
      font-size: clamp(3rem, 12vw, 4rem);
      color: #cbd5e0;
      margin-bottom: 1rem;
    }
    
    .empty-state h3 {
      margin: 0 0 0.5rem;
      font-size: clamp(1rem, 4vw, 1.25rem);
    }
    
    .empty-state p {
      color: #718096;
      margin-bottom: 1.5rem;
      font-size: clamp(0.75rem, 3vw, 0.875rem);
    }
    
    /* Modal Responsive */
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
      padding: 1rem;
    }
    
    .modal.show {
      display: flex;
    }
    
    .modal-content {
      background: white;
      border-radius: clamp(1rem, 5vw, 1.5rem);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      animation: modalSlideIn 0.3s ease;
    }
    
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: clamp(1rem, 4vw, 1.25rem) clamp(1rem, 4vw, 1.5rem);
      border-bottom: 1px solid #eef2f6;
    }
    
    .modal-header h2 {
      margin: 0;
      font-size: clamp(1.125rem, 4.5vw, 1.5rem);
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 1.75rem;
      cursor: pointer;
      color: #95a5a6;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;
    }
    
    .close-btn:hover {
      background: #f0f0f0;
      color: #667eea;
    }
    
    .modal-body {
      padding: clamp(1rem, 4vw, 1.5rem);
    }
    
    /* Formulario */
    .form-group {
      margin-bottom: clamp(1rem, 4vw, 1.25rem);
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #2c3e50;
      font-size: clamp(0.75rem, 3vw, 0.875rem);
    }
    
    .form-group input {
      width: 100%;
      padding: clamp(0.625rem, 2.5vw, 0.75rem) clamp(0.75rem, 3vw, 1rem);
      border: 2px solid #e0e0e0;
      border-radius: clamp(0.5rem, 2.5vw, 0.75rem);
      font-size: clamp(0.813rem, 3vw, 0.875rem);
      transition: all 0.2s;
      font-family: inherit;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .form-group input.is-invalid {
      border-color: #dc2626;
    }
    
    .form-group input[type="color"] {
      height: 50px;
      cursor: pointer;
      padding: 0.25rem;
    }
    
    .error {
      color: #dc2626;
      font-size: clamp(0.688rem, 2.5vw, 0.75rem);
      margin-top: 0.25rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      flex-wrap: wrap;
    }
    
    .btn-secondary {
      background: white;
      border: 2px solid #e0e0e0;
      padding: clamp(0.625rem, 2.5vw, 0.75rem) clamp(1rem, 4vw, 1.25rem);
      border-radius: clamp(0.5rem, 2.5vw, 0.75rem);
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      font-size: clamp(0.75rem, 3vw, 0.875rem);
      min-height: 44px;
    }
    
    .btn-secondary:hover {
      background: #f8f9fa;
      border-color: #667eea;
    }
    
    /* Responsive Breakpoints */
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .btn-primary {
        justify-content: center;
      }
    }
    
    @media (max-width: 640px) {
      .materias-grid {
        grid-template-columns: 1fr;
      }
      
      .materia-stats {
        flex-direction: column;
        align-items: stretch;
      }
      
      .btn-stats {
        justify-content: center;
      }
      
      .stat {
        justify-content: center;
      }
    }
    
    @media (max-width: 480px) {
      .materia-header {
        flex-direction: column;
      }
      
      .materia-actions {
        align-self: flex-end;
      }
      
      .modal-content {
        width: 95%;
      }
    }
    
    /* Touch-friendly */
    @media (hover: none) and (pointer: coarse) {
      .btn-icon:active {
        background: #f0f0f0;
      }
      
      .btn-primary:active {
        transform: scale(0.98);
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
        let tareas: any[] = [];
        if (Array.isArray(response)) {
          tareas = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          tareas = response.data;
        } else if (response && response.tareas && Array.isArray(response.tareas)) {
          tareas = response.tareas;
        } else {
          tareas = [];
        }
        
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