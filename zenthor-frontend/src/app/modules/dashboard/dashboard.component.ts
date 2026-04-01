import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { TareasService } from '../../core/services/tareas.service';
import { ExamenesService } from '../../core/services/examenes.service';
import { MateriasService } from '../../core/services/materias.service';
import { TareaWithMateria } from '../../core/models/tarea.model';
import { ExamenWithMateria } from '../../core/models/examen.model';
import { Materia } from '../../core/models/materia.model';

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
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="stat-info">
            <h3>{{ tareasPendientes }}</h3>
            <p>Tareas Pendientes</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="stat-info">
            <h3>{{ examenesProximosCount }}</h3>
            <p>Exámenes Próximos</p>
          </div>
        </div>
        <div class="stat-card">
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
            <div *ngIf="tareasProximas.length === 0" class="empty-state">
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
                </div>
              </div>
              <button class="complete-btn" (click)="completarTarea(tarea.id)">
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
            <div *ngIf="examenesProximosList.length === 0" class="empty-state">
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
              <button class="details-btn" (click)="verDetallesExamen(examen)">
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
            <div *ngIf="materiasConTareas.length === 0" class="empty-state">
              <i class="fas fa-trophy"></i>
              <p>¡Todas tus materias están al día!</p>
            </div>
            <div *ngFor="let materia of materiasConTareas" class="subject-item">
              <div class="subject-info">
                <span class="subject-color" [style.backgroundColor]="materia.color"></span>
                <div class="subject-details">
                  <strong>{{ materia.nombre }}</strong>
                  <span>{{ materia.profesor }}</span>
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
    }
    .task-date, .exam-date {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .complete-btn, .details-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
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
    }
    .details-btn {
      background: #e3f2fd;
      color: #2196f3;
    }
    .details-btn:hover {
      background: #2196f3;
      color: white;
    }
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #95a5a6;
    }
    .empty-state i {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .subject-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
    }
    .subject-info {
      display: flex;
      align-items: center;
      gap: 12px;
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
    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
      .chart-card {
        grid-column: span 1;
      }
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  tareasPendientes: number = 0;
  examenesProximosCount: number = 0;  // Cambiado de examenesProximos a examenesProximosCount
  materiasActivas: number = 0;
  tareasCompletadas: number = 0;
  tareasProximas: TareaWithMateria[] = [];
  examenesProximosList: ExamenWithMateria[] = [];
  materiasConTareas: any[] = [];

  private chart: Chart | null = null;

  constructor(
    private tareasService: TareasService,
    private examenesService: ExamenesService,
    private materiasService: MateriasService
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.nombre_completo?.split(' ')[0] || 'Usuario';
    }

    this.cargarDatos();
  }

  cargarDatos() {
    this.tareasService.getTareasProximas().subscribe({
      next: (tareas: TareaWithMateria[]) => {
        this.tareasProximas = tareas.slice(0, 5);
        this.tareasPendientes = tareas.length;
        this.tareasCompletadas = Math.floor(Math.random() * 50);
      },
      error: (error: any) => console.error('Error cargando tareas:', error)
    });

    this.examenesService.getExamenesProximos().subscribe({
      next: (examenes: ExamenWithMateria[]) => {
        this.examenesProximosList = examenes.slice(0, 5);
        this.examenesProximosCount = examenes.length;
      },
      error: (error: any) => console.error('Error cargando exámenes:', error)
    });

    this.materiasService.getMateriasActivas().subscribe({
      next: (materias: Materia[]) => {
        this.materiasActivas = materias.length;
        this.materiasConTareas = materias.map((m: Materia) => ({
          ...m,
          tareas_pendientes: Math.floor(Math.random() * 5)
        })).filter((m: any) => m.tareas_pendientes > 0);
      },
      error: (error: any) => console.error('Error cargando materias:', error)
    });

    setTimeout(() => {
      this.inicializarGrafico();
    }, 500);
  }

  inicializarGrafico() {
    const canvas = document.getElementById('progressChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
          {
            label: 'Tareas completadas',
            data: [4, 7, 5, 8, 12, 6, 9],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Horas de estudio',
            data: [2, 3, 2.5, 4, 5, 3, 2],
            borderColor: '#48bb78',
            backgroundColor: 'rgba(72, 187, 120, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
          }
        }
      }
    });
  }

  completarTarea(id: number) {
    this.tareasService.completarTarea(id).subscribe({
      next: () => {
        this.tareasProximas = this.tareasProximas.filter((t: TareaWithMateria) => t.id !== id);
        this.tareasPendientes--;
        this.tareasCompletadas++;
      },
      error: (error: any) => console.error('Error completando tarea:', error)
    });
  }

  verDetallesExamen(examen: ExamenWithMateria) {
    alert(`Examen de ${examen.materia_nombre}\nFecha: ${new Date(examen.fecha_examen).toLocaleDateString()}\nAula: ${examen.aula || 'No especificada'}\nTemas: ${examen.temas || 'No especificados'}`);
  }
}
