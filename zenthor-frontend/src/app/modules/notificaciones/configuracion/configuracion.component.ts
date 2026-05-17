import { Component, OnInit } from '@angular/core';
import { NotificacionesService, ConfigNotificaciones } from '../../../core/services/notificaciones.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-configuracion',
  template: `
    <div class="notificaciones-container">
      <div class="page-header">
        <h1>🔔 Configuración de Notificaciones</h1>
        <p>Recibe alertas sobre tus tareas, exámenes y recordatorios importantes</p>
      </div>

      <div class="config-card">
        <div class="config-section">
          <h3><i class="fas fa-envelope"></i> Notificaciones por Email</h3>
          <div class="toggle-switch">
            <label class="switch">
              <input type="checkbox" [(ngModel)]="config.email_activo">
              <span class="slider round"></span>
            </label>
            <span>Recibir notificaciones por correo electrónico</span>
          </div>
          <p class="config-hint">Recibirás recordatorios de tareas y exámenes a tu correo registrado</p>
        </div>

        <div class="config-section">
          <h3><i class="fab fa-whatsapp"></i> Notificaciones por WhatsApp</h3>
          <div class="toggle-switch">
            <label class="switch">
              <input type="checkbox" [(ngModel)]="config.whatsapp_activo" (change)="onWhatsappToggle()">
              <span class="slider round"></span>
            </label>
            <span>Recibir notificaciones por WhatsApp</span>
          </div>
          <div class="whatsapp-input" *ngIf="config.whatsapp_activo">
            <input type="tel" class="form-control" [(ngModel)]="config.telefono" placeholder="+52 123 456 7890">
            <small>Ingresa tu número con código de país (ej: +521234567890)</small>
          </div>
        </div>

        <div class="config-section">
          <h3><i class="fas fa-clock"></i> Recordatorios automáticos</h3>
          <div class="checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="config.recordatorio_24h">
              Recordatorio 24 horas antes
            </label>
            <label>
              <input type="checkbox" [(ngModel)]="config.recordatorio_1h">
              Recordatorio 1 hora antes
            </label>
          </div>
        </div>

        <div class="config-actions">
          <button class="btn-primary" (click)="guardarConfiguracion()" [disabled]="guardando">
            <i class="fas fa-save"></i> {{ guardando ? 'Guardando...' : 'Guardar configuración' }}
          </button>
          <button class="btn-secondary" (click)="enviarPrueba()">
            <i class="fas fa-paper-plane"></i> Enviar notificación de prueba
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notificaciones-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .page-header { text-align: center; margin-bottom: 2rem; }
    .page-header h1 { font-size: 2rem; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .config-card { background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .config-section { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
    .config-section h3 { margin-bottom: 1rem; color: #1f2937; }
    .toggle-switch { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
    .switch { position: relative; display: inline-block; width: 50px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: 0.4s; border-radius: 34px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: 0.4s; border-radius: 50%; }
    input:checked + .slider { background: linear-gradient(135deg, #667eea, #764ba2); }
    input:checked + .slider:before { transform: translateX(26px); }
    .config-hint { font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; }
    .whatsapp-input { margin-top: 1rem; padding-left: 1rem; }
    .form-control { width: 100%; max-width: 300px; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.5rem; }
    .checkbox-group { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .checkbox-group label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .config-actions { display: flex; gap: 1rem; margin-top: 2rem; }
    .btn-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 500; }
    .btn-secondary { background: #f3f4f6; border: 1px solid #d1d5db; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
    @media (max-width: 640px) { .config-actions { flex-direction: column; } }
  `]
})
export class ConfiguracionComponent implements OnInit {
  config: ConfigNotificaciones = {
    whatsapp_activo: false,
    telefono: '',
    email_activo: true,
    recordatorio_24h: true,
    recordatorio_1h: true
  };
  guardando = false;

  constructor(
    private notificacionesService: NotificacionesService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  cargarConfiguracion(): void {
    const svc: any = this.notificacionesService;
    let obs: any = null;
    if (typeof svc.obtenerConfiguracion === 'function') {
      obs = svc.obtenerConfiguracion();
    } else if (typeof svc.getConfiguracion === 'function') {
      obs = svc.getConfiguracion();
    }

    if (obs && typeof obs.subscribe === 'function') {
      obs.subscribe({
        next: (res: any) => {
          if (res?.data) {
            this.config = { ...this.config, ...res.data };
          }
        },
        error: () => {}
      });
    }
  }

  onWhatsappToggle(): void {
    if (this.config.whatsapp_activo && !this.config.telefono) {
      this.toastr.info('Ingresa tu número de WhatsApp para recibir notificaciones');
    }
  }

  guardarConfiguracion(): void {
    this.guardando = true;
    this.notificacionesService.guardarConfiguracion(this.config).subscribe({
      next: () => {
        this.toastr.success('Configuración guardada correctamente');
        this.guardando = false;
      },
      error: () => {
        this.toastr.error('Error al guardar configuración');
        this.guardando = false;
      }
    });
  }

  enviarPrueba(): void {
    this.notificacionesService.enviarPrueba().subscribe({
      next: () => {
        this.toastr.success('Notificación de prueba enviada');
      },
      error: () => {
        this.toastr.error('Error al enviar prueba');
      }
    });
  }
}