import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartItem } from 'chart.js/auto';
import { TareasService } from '../../../core/services/tareas.service';
import { ExamenesService } from '../../../core/services/examenes.service';
import { MateriasService } from '../../../core/services/materias.service';
import { TareaWithMateria } from '../../../core/models/tarea.model';
import { ExamenWithMateria } from '../../../core/models/examen.model';
import { Materia } from '../../../core/models/materia.model';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  // Datos del usuario
  userName: string = '';
  
  // Estadísticas
  tareasPendientes: number = 0;
  examenesProximosCount: number = 0;
  materiasActivas: number = 0;
  tareasCompletadas: number = 0;
  progresoAcademico: number = 0;
  
  // Listas de datos
  tareasProximas: TareaWithMateria[] = [];
  examenesProximosList: ExamenWithMateria[] = [];
  materiasConTareas: any[] = [];
  todasMaterias: Materia[] = [];
  
  // Estados de carga
  cargandoTareas: boolean = true;
  cargandoExamenes: boolean = true;
  cargandoMaterias: boolean = true;
  cargandoEstadisticas: boolean = true;
  
  // Gráfico
  private chart: Chart | null = null;
  
  // Frases motivacionales
  frasesMotivacionales: string[] = [
    "¡Sigue así! Estás avanzando hacia tus metas 🚀",
    "Cada tarea completada es un paso más hacia el éxito 📚",
    "La constancia es la clave del éxito académico 💪",
    "¡Excelente trabajo! Mantén el ritmo ✨",
    "Tu esfuerzo de hoy es el éxito de mañana 🌟"
  ];
  fraseMotivacional: string = "";

  constructor(
    private tareasService: TareasService,
    private examenesService: ExamenesService,
    private materiasService: MateriasService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerNombreUsuario();
    this.seleccionarFraseMotivacional();
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    // Pequeño delay para asegurar que el DOM está listo
    setTimeout(() => {
      this.inicializarGrafico();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  seleccionarFraseMotivacional(): void {
    const randomIndex = Math.floor(Math.random() * this.frasesMotivacionales.length);
    this.fraseMotivacional = this.frasesMotivacionales[randomIndex];
  }

  obtenerNombreUsuario(): void {
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

  cargarDatos(): void {
    this.cargarTareasProximas();
    this.cargarExamenesProximos();
    this.cargarMaterias();
    this.cargarEstadisticasCompletas();
  }

  cargarTareasProximas(): void {
    this.cargandoTareas = true;
    this.tareasService.getTareasProximas().subscribe({
      next: (tareas: TareaWithMateria[]) => {
        this.tareasProximas = tareas.slice(0, 5);
        this.cargandoTareas = false;
      },
      error: (error: any) => {
        console.error('Error cargando tareas próximas:', error);
        this.toastr.error('Error al cargar las tareas próximas', 'Error');
        this.cargandoTareas = false;
      }
    });
  }

  cargarExamenesProximos(): void {
    this.cargandoExamenes = true;
    this.examenesService.getExamenesProximos().subscribe({
      next: (examenes: ExamenWithMateria[]) => {
        this.examenesProximosList = examenes.slice(0, 5);
        this.examenesProximosCount = examenes.length;
        this.cargandoExamenes = false;
      },
      error: (error: any) => {
        console.error('Error cargando exámenes próximos:', error);
        this.toastr.error('Error al cargar los exámenes próximos', 'Error');
        this.cargandoExamenes = false;
      }
    });
  }

  cargarMaterias(): void {
    this.cargandoMaterias = true;
    this.materiasService.getMateriasActivas().subscribe({
      next: (materias: Materia[]) => {
        this.todasMaterias = materias;
        this.materiasActivas = materias.length;
        this.cargarTareasPorMateria(materias);
        this.cargandoMaterias = false;
      },
      error: (error: any) => {
        console.error('Error cargando materias:', error);
        this.toastr.error('Error al cargar las materias', 'Error');
        this.cargandoMaterias = false;
      }
    });
  }

  cargarTareasPorMateria(materias: Materia[]): void {
    this.tareasService.getTareas({ estado: 'pendiente' }).subscribe({
      next: (tareas: TareaWithMateria[]) => {
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

  cargarEstadisticasCompletas(): void {
    this.cargandoEstadisticas = true;
    this.tareasService.getTareas().subscribe({
      next: (tareas: TareaWithMateria[]) => {
        this.tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;
        this.tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
        
        // Calcular progreso académico (basado en tareas completadas vs total)
        const totalTareas = this.tareasPendientes + this.tareasCompletadas;
        this.progresoAcademico = totalTareas > 0 
          ? Math.round((this.tareasCompletadas / totalTareas) * 100) 
          : 0;
        
        this.cargandoEstadisticas = false;
      },
      error: (error: any) => {
        console.error('Error cargando estadísticas:', error);
        this.cargandoEstadisticas = false;
      }
    });
  }

  inicializarGrafico(): void {
    const canvas = document.getElementById('progressChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Datos para el gráfico (simulados pero basados en datos reales cuando estén disponibles)
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const tareasCompletadasData = [4, 6, 8, 7, 10, 5, 3];
    const horasEstudioData = [2.5, 3, 3.5, 4, 5, 3.5, 2];
    const productividadData = [68, 72, 78, 75, 85, 65, 58];

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: dias,
        datasets: [
          {
            label: '📝 Tareas completadas',
            data: tareasCompletadasData,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointStyle: 'circle'
          },
          {
            label: '📚 Horas de estudio',
            data: horasEstudioData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointStyle: 'circle'
          },
          {
            label: '🎯 Productividad (%)',
            data: productividadData,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointStyle: 'circle',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 10,
              padding: 15,
              font: {
                family: "'Inter', sans-serif",
                size: 11,
                weight: '500'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            titleColor: '#ffffff',
            bodyColor: '#e5e7eb',
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context: any) {
                let label = context.dataset.label || '';
                let value = context.parsed.y;
                if (context.dataset.label?.includes('Productividad')) {
                  return `${label}: ${value}%`;
                }
                if (context.dataset.label?.includes('Horas')) {
                  return `${label}: ${value} hrs`;
                }
                return `${label}: ${value}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#f3f4f6'
            },
            title: {
              display: true,
              text: 'Tareas / Horas',
              color: '#6b7280',
              font: {
                size: 11,
                weight: '500'
              }
            }
          },
          y1: {
            position: 'right',
            beginAtZero: true,
            max: 100,
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Productividad (%)',
              color: '#6b7280',
              font: {
                size: 11,
                weight: '500'
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11,
                weight: '500'
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  getPrioridadTexto(prioridad: string): string {
    const prioridades: { [key: string]: string } = {
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta'
    };
    return prioridades[prioridad] || prioridad;
  }

  getColorPrioridad(prioridad: string): string {
    const colores: { [key: string]: string } = {
      baja: '#10b981',
      media: '#f59e0b',
      alta: '#ef4444'
    };
    return colores[prioridad] || '#6b7280';
  }

  completarTarea(id: number): void {
    this.tareasService.completarTarea(id).subscribe({
      next: () => {
        const tareaCompletada = this.tareasProximas.find(t => t.id === id);
        this.tareasProximas = this.tareasProximas.filter(t => t.id !== id);
        this.tareasPendientes--;
        this.tareasCompletadas++;
        
        // Recalcular progreso
        const totalTareas = this.tareasPendientes + this.tareasCompletadas;
        this.progresoAcademico = totalTareas > 0 
          ? Math.round((this.tareasCompletadas / totalTareas) * 100) 
          : 0;
        
        this.toastr.success('¡Tarea completada! 🎉 Sigue así', 'Éxito');
        
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

  actualizarMateriaTareas(materiaId: number): void {
    const materia = this.materiasConTareas.find(m => m.id === materiaId);
    if (materia) {
      materia.tareas_pendientes--;
      if (materia.tareas_pendientes === 0) {
        this.materiasConTareas = this.materiasConTareas.filter(m => m.id !== materiaId);
      }
    }
  }

  verDetallesExamen(examen: ExamenWithMateria): void {
    const fechaFormateada = new Date(examen.fecha_examen).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    this.toastr.info(
      `<div style="text-align: left;">
        <strong>📚 ${examen.materia_nombre}</strong><br/>
        📅 Fecha: ${fechaFormateada}<br/>
        📍 Aula: ${examen.aula || 'No especificada'}<br/>
        📖 Temas: ${examen.temas || 'No especificados'}
      </div>`,
      'Detalles del Examen',
      { 
        timeOut: 8000, 
        enableHtml: true,
        positionClass: 'toast-top-right'
      }
    );
  }

  irATareas(): void {
    this.router.navigate(['/tareas']);
  }

  irAExamenes(): void {
    this.router.navigate(['/examenes']);
  }

  irAMaterias(): void {
    this.router.navigate(['/materias']);
  }

  handleImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/80x80?text=Z';
  }
}