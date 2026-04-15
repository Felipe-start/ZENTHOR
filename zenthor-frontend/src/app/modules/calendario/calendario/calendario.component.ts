import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { ApiService } from '../../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events: (fetchInfo, successCallback, failureCallback) => {
      this.apiService.get<any[]>('/api/calendario/eventos').subscribe({
        next: (res) => {
          const eventos = res.map((ev: any) => ({
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
          successCallback(eventos);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error al cargar eventos');
          failureCallback(err);
        }
      });
    },
    eventClick: (info) => {
      const props = info.event.extendedProps;
      if (props['type'] === 'tarea') {
        this.toastr.info(
          `<div style="text-align: left;">
            <strong>📋 ${info.event.title}</strong><br/>
            📚 Materia: ${props['materia']}<br/>
            ⚡ Prioridad: ${props['prioridad']}<br/>
            📝 ${props['descripcion'] || 'Sin descripción'}
          </div>`,
          'Detalles de Tarea',
          { enableHtml: true, timeOut: 5000 }
        );
      } else {
        this.toastr.info(
          `<div style="text-align: left;">
            <strong>📝 ${props['materia']}</strong><br/>
            📅 Fecha: ${new Date(info.event.start!).toLocaleString()}<br/>
            🏫 Aula: ${props['aula'] || 'No especificada'}<br/>
            📖 Temas: ${props['temas'] || 'No especificados'}
          </div>`,
          'Detalles de Examen',
          { enableHtml: true, timeOut: 5000 }
        );
      }
    },
    selectable: true,
    select: (info) => {
      // Crear evento rápido
      const fecha = new Date(info.startStr);
      const fechaStr = fecha.toISOString().slice(0, 16);
      const tipo = confirm('¿Crear una Tarea? (Aceptar) o ¿Crear un Examen? (Cancelar)');
      if (tipo) {
        this.router.navigate(['/tareas/nuevo'], { queryParams: { fecha: fechaStr } });
      } else {
        this.router.navigate(['/examenes/nuevo'], { queryParams: { fecha: fechaStr } });
      }
    },
    locale: 'es',
    firstDay: 1,
    weekends: true,
    nowIndicator: true,
    height: 'auto',
    editable: false,
    eventDidMount: (info) => {
      // Tooltip personalizado
      (info.el as HTMLElement).setAttribute('title', info.event.title);
    }
  };

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {}
}