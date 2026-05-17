import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { ApiService } from '../../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

interface EventoCalendario {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    type: 'tarea' | 'examen';
    materia?: string;
    prioridad?: string;
    descripcion?: string;
    aula?: string;
    temas?: string;
  };
  textColor: string;
  className: string;
}

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit, AfterViewInit {
  @ViewChild('modalCrear') modalCrear!: ElementRef<HTMLDivElement>;
  
  isLoading = true;
  selectedDate: Date | null = null;
  selectedDateStr: string = '';
  mostrarModal = false;
  tipoEvento: 'tarea' | 'examen' = 'tarea';
  
  // Formulario para creación rápida
  tituloRapido = '';
  materiaSeleccionada = '';
  prioridadRapida = 'media';
  materiasDisponibles: any[] = [];
  
  // Estadísticas
  tareasCount = 0;
  examenesCount = 0;
  eventosMes = 0;
  
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista'
    },
    events: (fetchInfo, successCallback, failureCallback) => {
      this.cargarEventos(successCallback, failureCallback);
    },
    eventClick: (info) => {
      this.mostrarDetallesEvento(info);
    },
    selectable: true,
    select: (info) => {
      this.abrirModalCreacion(new Date(info.startStr));
    },
    locale: 'es',
    firstDay: 1,
    weekends: true,
    nowIndicator: true,
    height: 'auto',
    editable: false,
    eventDidMount: (info) => {
      (info.el as HTMLElement).setAttribute('title', info.event.title);
      this.agregarTooltipAnimado(info.el as HTMLElement, info.event.title);
    },
    loading: (isLoading) => {
      this.isLoading = isLoading;
    }
  };

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarMaterias();
    this.actualizarEstadisticas();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  cargarMaterias(): void {
    this.apiService.get<any[]>('/api/materias').subscribe({
      next: (res) => {
        this.materiasDisponibles = res || [];
      },
      error: () => {
        this.materiasDisponibles = [];
      }
    });
  }

  cargarEventos(successCallback: Function, failureCallback: Function): void {
    this.apiService.get<any[]>('/api/calendario/eventos').subscribe({
      next: (res) => {
        const eventos = (res || []).map((ev: any) => ({
          id: ev.id,
          title: ev.title,
          start: ev.start,
          end: ev.end,
          backgroundColor: ev.color,
          borderColor: ev.color,
          extendedProps: ev.extendedProps,
          textColor: '#ffffff',
          className: `event-${ev.extendedProps?.type}`
        }));
        this.contarEventos(eventos);
        successCallback(eventos);
      },
      error: (err) => {
        console.error(err);
        failureCallback(err);
      }
    });
  }

  contarEventos(eventos: any[]): void {
    this.tareasCount = eventos.filter(e => e.extendedProps?.type === 'tarea').length;
    this.examenesCount = eventos.filter(e => e.extendedProps?.type === 'examen').length;
    this.eventosMes = eventos.length;
  }

  actualizarEstadisticas(): void {
    // Se actualiza al cargar eventos
  }

  abrirModalCreacion(fecha: Date): void {
    this.selectedDate = fecha;
    this.selectedDateStr = fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.mostrarModal = true;
    this.tituloRapido = '';
    this.prioridadRapida = 'media';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.selectedDate = null;
  }

  seleccionarTipo(tipo: 'tarea' | 'examen'): void {
    this.tipoEvento = tipo;
  }

  crearEventoRapido(): void {
    if (!this.tituloRapido.trim()) {
      this.toastr.warning('Ingresa un título para el evento');
      return;
    }

    const fechaISO = this.selectedDate?.toISOString() || new Date().toISOString();
    const fechaFormateada = fechaISO.slice(0, 16);

    if (this.tipoEvento === 'tarea') {
      this.router.navigate(['/tareas/nueva'], { 
        queryParams: { 
          fecha: fechaFormateada,
          titulo: this.tituloRapido,
          prioridad: this.prioridadRapida,
          materia_id: this.materiaSeleccionada
        } 
      });
    } else {
      this.router.navigate(['/examenes/nuevo'], { 
        queryParams: { 
          fecha: fechaFormateada,
          materia_id: this.materiaSeleccionada
        } 
      });
    }
    this.cerrarModal();
  }

  mostrarDetallesEvento(info: any): void {
    const props = info.event.extendedProps;
    const fecha = new Date(info.event.start);
    const fechaFormateada = fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (props['type'] === 'tarea') {
      this.toastr.info(
        `<div style="text-align: left;">
          <div style="font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem;">
            📋 ${info.event.title}
          </div>
          <div style="margin-bottom: 0.5rem;">
            <i class="fas fa-book" style="color: #6366f1; width: 24px;"></i> 
            <strong>Materia:</strong> ${props['materia'] || 'No especificada'}
          </div>
          <div style="margin-bottom: 0.5rem;">
            <i class="fas fa-calendar-alt" style="color: #6366f1; width: 24px;"></i> 
            <strong>Fecha:</strong> ${fechaFormateada}
          </div>
          <div style="margin-bottom: 0.5rem;">
            <i class="fas fa-flag" style="color: ${props['prioridad'] === 'alta' ? '#ef4444' : props['prioridad'] === 'media' ? '#f59e0b' : '#10b981'}; width: 24px;"></i> 
            <strong>Prioridad:</strong> ${props['prioridad']?.toUpperCase() || 'MEDIA'}
          </div>
          ${props['descripcion'] ? `
          <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #e5e7eb;">
            <i class="fas fa-align-left" style="color: #6366f1; width: 24px;"></i> 
            <strong>Descripción:</strong><br>
            ${props['descripcion'].substring(0, 150)}${props['descripcion'].length > 150 ? '...' : ''}
          </div>
          ` : ''}
        </div>`,
        '📌 Detalles de Tarea',
        { enableHtml: true, timeOut: 6000, positionClass: 'toast-top-right' }
      );
    } else {
      this.toastr.info(
        `<div style="text-align: left;">
          <div style="font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem;">
            📝 ${props['materia'] || 'Examen'}
          </div>
          <div style="margin-bottom: 0.5rem;">
            <i class="fas fa-calendar-alt" style="color: #10b981; width: 24px;"></i> 
            <strong>Fecha:</strong> ${fechaFormateada}
          </div>
          <div style="margin-bottom: 0.5rem;">
            <i class="fas fa-door-open" style="color: #10b981; width: 24px;"></i> 
            <strong>Aula:</strong> ${props['aula'] || 'No especificada'}
          </div>
          <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #e5e7eb;">
            <i class="fas fa-book-open" style="color: #10b981; width: 24px;"></i> 
            <strong>Temas:</strong><br>
            ${props['temas'] || 'No especificados'}
          </div>
        </div>`,
        '🎓 Detalles de Examen',
        { enableHtml: true, timeOut: 6000, positionClass: 'toast-top-right' }
      );
    }
  }

  agregarTooltipAnimado(elemento: HTMLElement, texto: string): void {
    elemento.addEventListener('mouseenter', (e) => {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip-calendario';
      tooltip.textContent = texto;
      tooltip.style.position = 'absolute';
      tooltip.style.background = 'rgba(0,0,0,0.85)';
      tooltip.style.color = 'white';
      tooltip.style.padding = '0.25rem 0.75rem';
      tooltip.style.borderRadius = '8px';
      tooltip.style.fontSize = '0.75rem';
      tooltip.style.zIndex = '1000';
      tooltip.style.whiteSpace = 'nowrap';
      tooltip.style.maxWidth = '200px';
      tooltip.style.overflow = 'hidden';
      tooltip.style.textOverflow = 'ellipsis';
      tooltip.style.pointerEvents = 'none';
      
      const rect = elemento.getBoundingClientRect();
      tooltip.style.top = `${rect.top - 25 + window.scrollY}px`;
      tooltip.style.left = `${rect.left + rect.width / 2 - 50 + window.scrollX}px`;
      
      document.body.appendChild(tooltip);
      
      elemento.addEventListener('mouseleave', () => {
        tooltip.remove();
      }, { once: true });
    });
  }

  irATareas(): void {
    this.router.navigate(['/tareas']);
  }

  irAExamenes(): void {
    this.router.navigate(['/examenes']);
  }
}