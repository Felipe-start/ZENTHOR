/*import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { TareasService } from '../../core/services/tareas.service';
import { ExamenesService } from '../../core/services/examenes.service';
import { MateriasService } from '../../core/services/materias.service';
import { TareaWithMateria } from '../../core/models/tarea.model';
import { ExamenWithMateria } from '../../core/models/examen.model';
import { Materia } from '../../core/models/materia.model';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1>Bienvenido de vuelta, {{ userName }}</h1>
          <p>Organiza tu vida académica y alcanza tus metas con ZENTHOR</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card" (click)="irATareas()">
          <div class="stat-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="stat-info">
            <h3>{{ tareasPendientes }}</h3>
            <p>Tareas Pendientes</p>
          </div>
        </div>
        <div class="stat-card" (click)="irAExamenes()">
          <div class="stat-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="stat-info">
            <h3>{{ examenesProximosCount }}</h3>
            <p>Exámenes Próximos</p>
          </div>
        </div>
        <div class="stat-card" (click)="irAMaterias()">
          <div class="stat-icon">
            <i class="fas fa-book"></i>
          </div>
          <div class="stat-info">
            <h3>{{ materiasActivas }}</h3>
            <p>Materias Activas</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <h3>{{ tareasCompletadas }}</h3>
            <p>Tareas Completadas</p>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Tareas Próximas -->
        <div class="card">
          <div class="card-header">
            <h3>Tareas Próximas</h3>
            <a routerLink="/tareas" class="view-all">Ver todas <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="card-body">
            <div *ngIf="cargandoTareas" class="loading-state">
              <div class="spinner"></div>
              <p>Cargando tareas...</p>
            </div>
            <div *ngIf="!cargandoTareas && tareasProximas.length === 0" class="empty-state">
              <i class="fas fa-check-circle"></i>
              <p>¡No tienes tareas pendientes!</p>
            </div>
            <div *ngFor="let tarea of tareasProximas" class="task-item">
              <div class="task-info">
                <div class="task-title">
                  <span class="task-dot" [style.backgroundColor]="tarea.materia_color"></span>
                  <strong>{{ tarea.titulo }}</strong>
                </div>
                <div class="task-meta">
                  <span>{{ tarea.materia_nombre }}</span>
                  <span class="task-date">
                    <i class="far fa-calendar"></i>
                    {{ tarea.fecha_entrega | date:'dd/MM/yyyy' }}
                  </span>
                  <span class="task-priority" [class]="tarea.prioridad">
                    <i class="fas fa-flag"></i>
                    {{ getPrioridadTexto(tarea.prioridad) }}
                  </span>
                </div>
              </div>
              <button class="complete-btn" (click)="completarTarea(tarea.id)" title="Marcar como completada">
                <i class="fas fa-check"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Exámenes Próximos -->
        <div class="card">
          <div class="card-header">
            <h3>Próximos Exámenes</h3>
            <a routerLink="/examenes" class="view-all">Ver todas <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="card-body">
            <div *ngIf="cargandoExamenes" class="loading-state">
              <div class="spinner"></div>
              <p>Cargando exámenes...</p>
            </div>
            <div *ngIf="!cargandoExamenes && examenesProximosList.length === 0" class="empty-state">
              <i class="fas fa-smile"></i>
              <p>¡No hay exámenes próximos!</p>
            </div>
            <div *ngFor="let examen of examenesProximosList" class="exam-item">
              <div class="exam-info">
                <div class="exam-title">
                  <span class="exam-dot" [style.backgroundColor]="examen.materia_color"></span>
                  <strong>{{ examen.materia_nombre }}</strong>
                </div>
                <div class="exam-meta">
                  <span>{{ examen.aula ? 'Aula ' + examen.aula : 'Sin aula asignada' }}</span>
                  <span class="exam-date">
                    <i class="far fa-clock"></i>
                    {{ examen.fecha_examen | date:'dd/MM/yyyy' }}
                  </span>
                </div>
              </div>
              <button class="details-btn" (click)="verDetallesExamen(examen)" title="Ver detalles">
                <i class="fas fa-info-circle"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Gráfico de Progreso -->
        <div class="card chart-card">
          <div class="card-header">
            <h3>Progreso Académico</h3>
            <span class="chart-subtitle">Últimos 7 días</span>
          </div>
          <div class="card-body">
            <canvas id="progressChart"></canvas>
          </div>
        </div>

        <!-- Materias con tareas pendientes -->
        <div class="card">
          <div class="card-header">
            <h3>Materias con tareas pendientes</h3>
            <a routerLink="/materias" class="view-all">Gestionar <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="card-body">
            <div *ngIf="cargandoMaterias" class="loading-state">
              <div class="spinner"></div>
              <p>Cargando materias...</p>
            </div>
            <div *ngIf="!cargandoMaterias && materiasConTareas.length === 0" class="empty-state">
              <i class="fas fa-trophy"></i>
              <p>¡Todas tus materias están al día!</p>
            </div>
            <div *ngFor="let materia of materiasConTareas" class="subject-item">
              <div class="subject-info">
                <span class="subject-color" [style.backgroundColor]="materia.color || '#667eea'"></span>
                <div class="subject-details">
                  <strong>{{ materia.nombre }}</strong>
                  <span>{{ materia.profesor || 'Sin profesor asignado' }}</span>
                </div>
              </div>
              <div class="task-count">
                <span class="badge">{{ materia.tareas_pendientes }} tarea(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 24px;
      padding: 32px 40px;
      margin-bottom: 32px;
      color: white;
    }
    .hero-content h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .hero-content p {
      opacity: 0.9;
      margin: 0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .stat-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 28px;
    }
    .stat-info h3 {
      font-size: 32px;
      font-weight: 700;
      margin: 0;
      color: #2c3e50;
    }
    .stat-info p {
      margin: 4px 0 0;
      color: #7f8c8d;
      font-size: 14px;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    .card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      overflow: hidden;
    }
    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid #eef2f6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }
    .view-all {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }
    .card-body {
      padding: 20px 24px;
      max-height: 400px;
      overflow-y: auto;
    }
    .task-item, .exam-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #eef2f6;
    }
    .task-item:last-child, .exam-item:last-child {
      border-bottom: none;
    }
    .task-info, .exam-info {
      flex: 1;
    }
    .task-title, .exam-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .task-dot, .exam-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .task-meta, .exam-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #7f8c8d;
      margin-left: 22px;
      flex-wrap: wrap;
    }
    .task-date, .exam-date {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .task-priority {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }
    .task-priority.alta {
      background: #fee2e2;
      color: #dc2626;
    }
    .task-priority.media {
      background: #fef3c7;
      color: #d97706;
    }
    .task-priority.baja {
      background: #dcfce7;
      color: #10b981;
    }
    .complete-btn, .details-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .complete-btn {
      background: #e8f5e9;
      color: #4caf50;
    }
    .complete-btn:hover {
      background: #4caf50;
      color: white;
      transform: scale(1.05);
    }
    .details-btn {
      background: #e3f2fd;
      color: #2196f3;
    }
    .details-btn:hover {
      background: #2196f3;
      color: white;
      transform: scale(1.05);
    }
    .empty-state, .loading-state {
      text-align: center;
      padding: 40px 20px;
      color: #95a5a6;
    }
    .empty-state i {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .loading-state .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e0e0e0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .subject-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #eef2f6;
    }
    .subject-item:last-child {
      border-bottom: none;
    }
    .subject-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .subject-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .subject-details {
      display: flex;
      flex-direction: column;
    }
    .subject-details span {
      font-size: 12px;
      color: #7f8c8d;
    }
    .badge {
      background: #ff9800;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }
    .chart-card {
      grid-column: span 2;
    }
    .chart-subtitle {
      font-size: 12px;
      color: #95a5a6;
    }
    @media (max-width: 768px) {
      .dashboard {
        padding: 12px;
      }
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
      .chart-card {
        grid-column: span 1;
      }
      .stats-grid {
        grid-template-columns: 1fr;
      }
      .hero-section {
        padding: 24px;
      }
      .hero-content h1 {
        font-size: 24px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName: string = '';
  tareasPendientes: number = 0;
  examenesProximosCount: number = 0;
  materiasActivas: number = 0;
  tareasCompletadas: number = 0;
  tareasProximas: TareaWithMateria[] = [];
  examenesProximosList: ExamenWithMateria[] = [];
  materiasConTareas: any[] = [];
  
  cargandoTareas: boolean = true;
  cargandoExamenes: boolean = true;
  cargandoMaterias: boolean = true;

  private chart: Chart | null = null;

  constructor(
    private tareasService: TareasService,
    private examenesService: ExamenesService,
    private materiasService: MateriasService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.obtenerNombreUsuario();
    this.cargarDatos();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  obtenerNombreUsuario() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName = user.nombre_completo?.split(' ')[0] || 'Usuario';
      } catch (e) {
        this.userName = 'Usuario';
      }
    }
  }

  cargarDatos() {
    this.cargarTareasProximas();
    this.cargarExamenesProximos();
    this.cargarMaterias();
    this.cargarEstadisticasCompletas();
  }

  cargarTareasProximas() {
    this.cargandoTareas = true;
    this.tareasService.getTareasProximas().subscribe({
      next: (tareas: TareaWithMateria[]) => {
        this.tareasProximas = tareas.slice(0, 5);
        this.cargandoTareas = false;
      },
      error: (error: any) => {
        console.error('Error cargando tareas:', error);
        this.toastr.error('Error al cargar las tareas próximas');
        this.cargandoTareas = false;
      }
    });
  }

  cargarExamenesProximos() {
    this.cargandoExamenes = true;
    this.examenesService.getExamenesProximos().subscribe({
      next: (examenes: ExamenWithMateria[]) => {
        this.examenesProximosList = examenes.slice(0, 5);
        this.examenesProximosCount = examenes.length;
        this.cargandoExamenes = false;
      },
      error: (error: any) => {
        console.error('Error cargando exámenes:', error);
        this.toastr.error('Error al cargar los exámenes próximos');
        this.cargandoExamenes = false;
      }
    });
  }

  cargarMaterias() {
    this.cargandoMaterias = true;
    this.materiasService.getMateriasActivas().subscribe({
      next: (materias: Materia[]) => {
        this.materiasActivas = materias.length;
        this.cargarTareasPorMateria(materias);
        this.cargandoMaterias = false;
      },
      error: (error: any) => {
        console.error('Error cargando materias:', error);
        this.toastr.error('Error al cargar las materias');
        this.cargandoMaterias = false;
      }
    });
  }

  cargarTareasPorMateria(materias: Materia[]) {
    // Cargar todas las tareas para contar pendientes por materia
    this.tareasService.getTareas({ estado: 'pendiente' }).subscribe({
      next: (tareas: TareaWithMateria[]) => {
        // Contar tareas pendientes por materia
        const tareasPorMateria = new Map<number, number>();
        tareas.forEach(tarea => {
          const count = tareasPorMateria.get(tarea.materia_id) || 0;
          tareasPorMateria.set(tarea.materia_id, count + 1);
        });

        this.materiasConTareas = materias
          .map(materia => ({
            ...materia,
            tareas_pendientes: tareasPorMateria.get(materia.id) || 0
          }))
          .filter(materia => materia.tareas_pendientes > 0)
          .sort((a, b) => b.tareas_pendientes - a.tareas_pendientes);
      },
      error: (error: any) => {
        console.error('Error cargando tareas por materia:', error);
      }
    });
  }

  cargarEstadisticasCompletas() {
    // Cargar todas las tareas para estadísticas completas
    this.tareasService.getTareas().subscribe({
      next: (tareas: TareaWithMateria[]) => {
        this.tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;
        this.tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
        
        // Inicializar gráfico después de tener los datos
        setTimeout(() => {
          this.inicializarGrafico();
        }, 500);
      },
      error: (error: any) => {
        console.error('Error cargando estadísticas:', error);
        setTimeout(() => {
          this.inicializarGrafico();
        }, 500);
      }
    });
  }

  inicializarGrafico() {
    const canvas = document.getElementById('progressChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    // Datos simulados para el gráfico
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const tareasCompletadasData = [4, 7, 5, 8, 12, 6, 9];
    const horasEstudioData = [2, 3, 2.5, 4, 5, 3, 2];

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: dias,
        datasets: [
          {
            label: 'Tareas completadas',
            data: tareasCompletadasData,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Horas de estudio',
            data: horasEstudioData,
            borderColor: '#48bb78',
            backgroundColor: 'rgba(72, 187, 120, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#48bb78',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 10
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#eef2f6'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  getPrioridadTexto(prioridad: string): string {
    const prioridades: { [key: string]: string } = {
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta'
    };
    return prioridades[prioridad] || prioridad;
  }

  completarTarea(id: number) {
    this.tareasService.completarTarea(id).subscribe({
      next: () => {
        // Actualizar la lista local
        const tareaCompletada = this.tareasProximas.find(t => t.id === id);
        this.tareasProximas = this.tareasProximas.filter(t => t.id !== id);
        this.tareasPendientes--;
        this.tareasCompletadas++;
        
        this.toastr.success('¡Tarea completada! 🎉', 'Éxito');
        
        // Actualizar materias con tareas pendientes
        if (tareaCompletada) {
          this.actualizarMateriaTareas(tareaCompletada.materia_id);
        }
      },
      error: (error: any) => {
        console.error('Error completando tarea:', error);
        this.toastr.error('Error al completar la tarea', 'Error');
      }
    });
  }

  actualizarMateriaTareas(materiaId: number) {
    const materia = this.materiasConTareas.find(m => m.id === materiaId);
    if (materia) {
      materia.tareas_pendientes--;
      if (materia.tareas_pendientes === 0) {
        this.materiasConTareas = this.materiasConTareas.filter(m => m.id !== materiaId);
      }
    }
  }

  verDetallesExamen(examen: ExamenWithMateria) {
    this.toastr.info(
      `📚 Materia: ${examen.materia_nombre}\n📅 Fecha: ${new Date(examen.fecha_examen).toLocaleDateString()}\n📍 Aula: ${examen.aula || 'No especificada'}\n📖 Temas: ${examen.temas || 'No especificados'}`,
      'Detalles del Examen',
      { timeOut: 5000, enableHtml: true }
    );
  }

  irATareas() {
    this.router.navigate(['/tareas']);
  }

  irAExamenes() {
    this.router.navigate(['/examenes']);
  }

  irAMaterias() {
    this.router.navigate(['/materias']);
  }
}

*/