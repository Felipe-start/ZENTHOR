import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon: string;
  time: Date;
  read: boolean;
  action?: {
    label: string;
    link: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject = new Subject<Notification[]>();
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private toastr: ToastrService) {
    this.cargarNotificacionesGuardadas();
  }

  private cargarNotificacionesGuardadas() {
    const saved = localStorage.getItem('zenthor_notifications');
    if (saved) {
      try {
        this.notifications = JSON.parse(saved);
        this.notificationsSubject.next(this.notifications);
      } catch (e) {
        console.error('Error cargando notificaciones:', e);
      }
    }
  }

  private guardarNotificaciones() {
    localStorage.setItem('zenthor_notifications', JSON.stringify(this.notifications));
    this.notificationsSubject.next(this.notifications);
  }

  mostrarRecordatorioTarea(tarea: any, horas: number) {
    const message = horas === 24 
      ? `📋 "${tarea.titulo}" vence mañana. ¡Prepárate a tiempo!`
      : `⚠️ "${tarea.titulo}" vence en 1 hora. ¡No lo dejes para después!`;
    
    this.toastr.warning(message, '📌 Recordatorio de Tarea', {
      timeOut: 10000,
      extendedTimeOut: 5000,
      positionClass: 'toast-top-right',
      progressBar: true,
      closeButton: true,
      enableHtml: true
    });

    const notification: Notification = {
      id: Date.now().toString(),
      title: `📋 Recordatorio: ${tarea.titulo}`,
      message: `${message} Materia: ${tarea.materia_nombre}`,
      type: 'warning',
      icon: 'fas fa-bell',
      time: new Date(),
      read: false,
      action: {
        label: 'Ver tarea',
        link: `/tareas/${tarea.id}`
      }
    };
    
    this.notifications.unshift(notification);
    this.guardarNotificaciones();
  }

  mostrarExitoCompletarTarea(tarea: any) {
    this.toastr.success(
      `🎉 ¡Excelente! Has completado "${tarea.titulo}"`,
      'Tarea Completada',
      { timeOut: 5000, progressBar: true }
    );
  }

  mostrarBienvenida(nombre: string) {
    this.toastr.info(
      `¡Bienvenido a ZENTHOR, ${nombre}! 🎓 Organiza tu vida académica de manera inteligente.`,
      '¡Hola! 👋',
      { timeOut: 8000, progressBar: true, closeButton: true }
    );
  }

  getNotificacionesNoLeidas(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  marcarComoLeida(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.guardarNotificaciones();
    }
  }

  marcarTodasComoLeidas() {
    this.notifications.forEach(n => n.read = true);
    this.guardarNotificaciones();
  }

  eliminarNotificacion(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.guardarNotificaciones();
  }

  limpiarTodas() {
    this.notifications = [];
    this.guardarNotificaciones();
  }
}
