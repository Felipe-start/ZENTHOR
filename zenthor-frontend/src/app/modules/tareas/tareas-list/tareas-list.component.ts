import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
        <div>
          <h1>Mis Tareas</h1>
          <p>Gestiona todas tus tareas académicas</p>
        </div>
        <button class="btn-primary" routerLink="/tareas/nueva">
          <i class="fas fa-plus"></i>
          Nueva Tarea
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
    .tareas-container {
      max-width: 1200px;
      margin: 0 auto;
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
    }
    .page-header p {
      color: #718096;
      margin: 0;
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
    .filtros-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .filtros-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    .filtro-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #2c3e50;
    }
    .filtro-group select {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 14px;
      background: white;
    }
    .toggle-switch {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
    }
    .toggle-switch input {
      width: 20px;
      height: 20px;
      cursor: pointer;
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
    .empty-state {
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
    .empty-state h3 {
      margin: 0 0 8px 0;
    }
    .empty-state p {
      color: #718096;
      margin-bottom: 24px;
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
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.cargarMaterias();
    this.cargarTareas();
  }

  cargarMaterias() {
    this.materiasService.getMateriasActivas().subscribe({
      next: (materias) => {
        this.materias = materias;
      },
      error: (error) => {
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
        error: (error) => {
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
        error: (error) => {
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
        error: (error) => {
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
      error: (error) => {
        this.toastr.error('Error al completar la tarea');
      }
    });
  }
}