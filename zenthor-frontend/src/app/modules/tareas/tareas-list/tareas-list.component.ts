import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TareasService } from '../../../core/services/tareas.service';
import { MateriasService } from '../../../core/services/materias.service';
import { TareaWithMateria } from '../../../core/models/tarea.model';
import { Materia } from '../../../core/models/materia.model';

@Component({
  selector: 'app-tareas-list',
  template: `
    <div class="tareas-container">
      <div class="page-header">
        <div class="header-title">
          <h1>Mis Tareas</h1>
          <p>Gestiona todas tus tareas académicas</p>
        </div>
        <button class="btn-primary" routerLink="/tareas/nueva">
          <i class="fas fa-plus"></i>
          <span>Nueva Tarea</span>
        </button>
      </div>

      <!-- Filtros -->
      <div class="filtros-card">
        <div class="filtros-grid">
          <div class="filtro-group">
            <label>Materia</label>
            <select [(ngModel)]="filtros.materia_id" (change)="cargarTareas()">
              <option [value]="">Todas las materias</option>
              <option *ngFor="let materia of materias" [value]="materia.id">
                {{ materia.nombre }}
              </option>
            </select>
          </div>
          
          <div class="filtro-group">
            <label>Estado</label>
            <select [(ngModel)]="filtros.estado" (change)="cargarTareas()">
              <option value="">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="completada">Completadas</option>
            </select>
          </div>
          
          <div class="filtro-group">
            <label>Prioridad</label>
            <select [(ngModel)]="filtros.prioridad" (change)="cargarTareas()">
              <option value="">Todas</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          
          <div class="filtro-group">
            <label>Próximas 7 días</label>
            <div class="toggle-switch">
              <input type="checkbox" id="proximas" [(ngModel)]="soloProximas" (change)="cargarTareas()">
              <label for="proximas">Ver solo próximas</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando tareas...</p>
      </div>

      <!-- Lista de tareas -->
      <div *ngIf="!cargando" class="tareas-list">
        <div *ngIf="tareas.length === 0" class="empty-state">
          <i class="fas fa-tasks"></i>
          <h3>No hay tareas</h3>
          <p>Comienza creando una nueva tarea</p>
          <button class="btn-primary" routerLink="/tareas/nueva">
            <i class="fas fa-plus"></i>
            Crear primera tarea
          </button>
        </div>
        
        <div *ngFor="let tarea of tareas">
          <app-tarea-card
            [tarea]="tarea"
            (edit)="editarTarea($event)"
            (delete)="eliminarTarea($event)"
            (complete)="completarTarea($event)"
          ></app-tarea-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ============================================
       TAREAS-LIST - Fully Responsive Styles
       ============================================ */
    
    .tareas-container {
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
    
    /* Filtros Card */
    .filtros-card {
      background: white;
      border-radius: clamp(1rem, 4vw, 1.25rem);
      padding: clamp(1rem, 4vw, 1.5rem);
      margin-bottom: clamp(1.5rem, 5vw, 2rem);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .filtros-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
      gap: clamp(0.75rem, 3vw, 1.25rem);
    }
    
    .filtro-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #2c3e50;
      font-size: clamp(0.75rem, 3vw, 0.875rem);
    }
    
    .filtro-group select {
      width: 100%;
      padding: clamp(0.5rem, 2vw, 0.625rem) clamp(0.75rem, 3vw, 1rem);
      border: 2px solid #e0e0e0;
      border-radius: clamp(0.5rem, 2.5vw, 0.75rem);
      font-size: clamp(0.813rem, 3vw, 0.875rem);
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      min-height: 44px;
    }
    
    .filtro-group select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .toggle-switch {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.25rem;
      flex-wrap: wrap;
    }
    
    .toggle-switch input {
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: #667eea;
    }
    
    .toggle-switch label {
      margin-bottom: 0;
      cursor: pointer;
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
    
    /* Tareas List */
    .tareas-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    /* Empty State */
    .empty-state {
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
    
    /* Responsive */
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
      .filtros-grid {
        grid-template-columns: 1fr;
      }
      
      .filtros-card {
        padding: 1rem;
      }
    }
    
    @media (max-width: 480px) {
      .tareas-container {
        padding: 0.5rem;
      }
      
      .toggle-switch {
        justify-content: space-between;
      }
    }
  `]
})
export class TareasListComponent implements OnInit {
  tareas: TareaWithMateria[] = [];
  materias: Materia[] = [];
  cargando = true;
  soloProximas = false;
  
  filtros = {
    materia_id: '',
    estado: '',
    prioridad: ''
  };

  constructor(
    private tareasService: TareasService,
    private materiasService: MateriasService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.cargarMaterias();
    this.cargarFiltroDeQueryParams();
    this.cargarTareas();
  }

  cargarFiltroDeQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params['materia_id']) {
        this.filtros.materia_id = params['materia_id'];
      }
    });
  }

  cargarMaterias() {
    this.materiasService.getMateriasActivas().subscribe({
      next: (materias) => {
        this.materias = materias;
      },
      error: () => {
        this.toastr.error('Error al cargar materias');
      }
    });
  }

  cargarTareas() {
    this.cargando = true;
    
    if (this.soloProximas) {
      this.tareasService.getTareasProximas().subscribe({
        next: (tareas) => {
          this.tareas = tareas;
          this.cargando = false;
        },
        error: () => {
          this.toastr.error('Error al cargar tareas');
          this.cargando = false;
        }
      });
    } else {
      const params: any = {};
      if (this.filtros.materia_id) params.materia_id = parseInt(this.filtros.materia_id);
      if (this.filtros.estado) params.estado = this.filtros.estado;
      if (this.filtros.prioridad) params.prioridad = this.filtros.prioridad;
      
      this.tareasService.getTareas(params).subscribe({
        next: (tareas) => {
          this.tareas = tareas;
          this.cargando = false;
        },
        error: () => {
          this.toastr.error('Error al cargar tareas');
          this.cargando = false;
        }
      });
    }
  }

  editarTarea(tarea: TareaWithMateria) {
    this.router.navigate(['/tareas/editar', tarea.id]);
  }

  eliminarTarea(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      this.tareasService.deleteTarea(id).subscribe({
        next: () => {
          this.toastr.success('Tarea eliminada correctamente');
          this.cargarTareas();
        },
        error: () => {
          this.toastr.error('Error al eliminar la tarea');
        }
      });
    }
  }

  completarTarea(id: number) {
    this.tareasService.completarTarea(id).subscribe({
      next: () => {
        this.toastr.success('¡Tarea completada! 🎉');
        this.cargarTareas();
      },
      error: () => {
        this.toastr.error('Error al completar la tarea');
      }
    });
  }
}