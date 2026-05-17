import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
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
  
  // Estadísticas principales
  tareasPendientes: number = 0;
  examenesProximosCount: number = 0;
  materiasActivas: number = 0;
  tareasCompletadas: number = 0;
  progresoAcademico: number = 0;
  
  // Estadísticas detalladas
  tareasAtrasadas: number = 0;
  tareasPorCaducar: number = 0;
  tareasHoy: number = 0;
  examenesEstaSemana: number = 0;
  
  // Listas de datos
  tareasProximas: TareaWithMateria[] = [];
  tareasAtrasadasList: TareaWithMateria[] = [];
  tareasHoyList: TareaWithMateria[] = [];
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
    "Tu esfuerzo de hoy es el éxito de mañana 🌟",
    "No dejes para mañana lo que puedas hacer hoy ⏰",
    "El estudio diario construye un futuro brillante 💡"
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
    this.cargarTareasCompletas();
    this.cargarExamenesProximos();
    this.cargarMaterias();
    this.cargarEstadisticasCompletas();
  }

  cargarTareasCompletas(): void {
    this.cargandoTareas = true;
    this.tareasService.getTareas().subscribe({
      next: (tareas: TareaWithMateria[]) => {
        const ahora = new Date();
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);
        
        const tareasPendientes = tareas.filter(t => t.estado === 'pendiente');
        
        this.tareasAtrasadasList = tareasPendientes.filter(t => new Date(t.fecha_entrega) < ahora);
        this.tareasAtrasadas = this.tareasAtrasadasList.length;
        
        this.tareasHoyList = tareasPendientes.filter(t => {
          const fechaEntrega = new Date(t.fecha_entrega);
          return fechaEntrega >= hoy && fechaEntrega < manana;
        });
        this.tareasHoy = this.tareasHoyList.length;
        
        const limite24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
        this.tareasPorCaducar = tareasPendientes.filter(t => {
          const fechaEntrega = new Date(t.fecha_entrega);
          return fechaEntrega > ahora && fechaEntrega <= limite24h;
        }).length;
        
        const proximas7dias = tareasPendientes.filter(t => {
          const fechaEntrega = new Date(t.fecha_entrega);
          const diffDias = (fechaEntrega.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24);
          return diffDias > 0 && diffDias <= 7 && fechaEntrega >= manana;
        }).sort((a, b) => new Date(a.fecha_entrega).getTime() - new Date(b.fecha_entrega).getTime());
        
        this.tareasProximas = proximas7dias.slice(0, 5);
        this.cargandoTareas = false;
      },
      error: (error: any) => {
        console.error('Error cargando tareas:', error);
        this.toastr.error('Error al cargar las tareas', 'Error');
        this.cargandoTareas = false;
      }
    });
  }

  cargarExamenesProximos(): void {
    this.cargandoExamenes = true;
    this.examenesService.getExamenesProximos().subscribe({
      next: (examenes: ExamenWithMateria[]) => {
        const ahora = new Date();
        const dentro7dias = new Date(ahora);
        dentro7dias.setDate(dentro7dias.getDate() + 7);
        
        this.examenesProximosList = examenes.slice(0, 5);
        this.examenesProximosCount = examenes.length;
        this.examenesEstaSemana = examenes.filter(e => {
          const fechaExamen = new Date(e.fecha_examen);
          return fechaExamen >= ahora && fechaExamen <= dentro7dias;
        }).length;
        
        this.cargandoExamenes = false;
      },
      error: (error: any) => {
        console.error('Error cargando exámenes:', error);
        this.toastr.error('Error al cargar los exámenes', 'Error');
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
        const ahora = new Date();
        const tareasPendientes = tareas.filter(t => new Date(t.fecha_entrega) >= ahora);
        const tareasPorMateria = new Map<number, number>();
        
        tareasPendientes.forEach(tarea => {
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

    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    const tasaCompletado = this.tareasCompletadas / (this.tareasPendientes + this.tareasCompletadas) || 0.5;
    const tareasCompletadasData = [
      Math.round(4 * tasaCompletado),
      Math.round(6 * tasaCompletado),
      Math.round(8 * tasaCompletado),
      Math.round(7 * tasaCompletado),
      Math.round(10 * tasaCompletado),
      Math.round(5 * tasaCompletado),
      Math.round(3 * tasaCompletado)
    ];
    
    const horasEstudioData = [2.5, 3, 3.5, 4, 5, 3.5, 2];
    const productividadData = [
      Math.min(68 + Math.round(this.progresoAcademico * 0.2), 100),
      Math.min(72 + Math.round(this.progresoAcademico * 0.2), 100),
      Math.min(78 + Math.round(this.progresoAcademico * 0.2), 100),
      Math.min(75 + Math.round(this.progresoAcademico * 0.2), 100),
      Math.min(85 + Math.round(this.progresoAcademico * 0.2), 100),
      Math.min(65 + Math.round(this.progresoAcademico * 0.2), 100),
      Math.min(58 + Math.round(this.progresoAcademico * 0.2), 100)
    ];

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
            pointHoverRadius: 8
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
            pointHoverRadius: 8
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
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, boxWidth: 10, padding: 15, font: { size: 11, weight: '500' } }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            titleColor: '#ffffff',
            bodyColor: '#e5e7eb',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context: any) => {
                let label = context.dataset.label || '';
                let value = context.parsed.y;
                if (context.dataset.label?.includes('Productividad')) return `${label}: ${value}%`;
                if (context.dataset.label?.includes('Horas')) return `${label}: ${value} hrs`;
                return `${label}: ${value}`;
              }
            }
          }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f3f4f6' }, title: { display: true, text: 'Tareas / Horas', color: '#6b7280', font: { size: 11 } } },
          y1: { position: 'right', beginAtZero: true, max: 100, grid: { drawOnChartArea: false }, title: { display: true, text: 'Productividad (%)', color: '#6b7280', font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  getPrioridadTexto(prioridad: string): string {
    const prioridades: { [key: string]: string } = { baja: 'Baja', media: 'Media', alta: 'Alta' };
    return prioridades[prioridad] || prioridad;
  }

  completarTarea(id: number): void {
    this.tareasService.completarTarea(id).subscribe({
      next: () => {
        this.cargarTareasCompletas();
        this.cargarEstadisticasCompletas();
        this.toastr.success('¡Tarea completada! 🎉 Sigue así', 'Éxito');
      },
      error: () => this.toastr.error('Error al completar la tarea', 'Error')
    });
  }

  verDetallesExamen(examen: ExamenWithMateria): void {
    const fechaFormateada = new Date(examen.fecha_examen).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    this.toastr.info(
      `<div style="text-align:left;">
        <strong>📚 ${examen.materia_nombre}</strong><br/>
        📅 Fecha: ${fechaFormateada}<br/>
        📍 Aula: ${examen.aula || 'No especificada'}<br/>
        📖 Temas: ${examen.temas || 'No especificados'}
      </div>`,
      'Detalles del Examen',
      { timeOut: 8000, enableHtml: true, positionClass: 'toast-top-right' }
    );
  }

  irATareas(): void { this.router.navigate(['/tareas']); }
  irAExamenes(): void { this.router.navigate(['/examenes']); }
  irAMaterias(): void { this.router.navigate(['/materias']); }

  handleImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/80x80?text=ZENTHOR';
  }
}