import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-conexiones',
  template: `
    <div class="conexiones-container">
      <div class="page-header">
        <h1>🔌 Conecta tus plataformas</h1>
        <p>Sincroniza automáticamente tareas, exámenes y documentos desde tus plataformas favoritas</p>
      </div>

      <div class="conexiones-grid">
        <!-- Google Classroom -->
        <div class="conexion-card">
          <div class="card-icon google">
            <i class="fab fa-google"></i>
          </div>
          <h3>Google Classroom</h3>
          <p>Sincroniza tus clases, tareas y materiales</p>
          <div class="card-actions">
            <button class="btn-conectar" (click)="conectarGoogle()">
              <i class="fab fa-google"></i> Conectar con Google
            </button>
          </div>
        </div>

        <!-- Notion -->
        <div class="conexion-card">
          <div class="card-icon notion">
            <i class="fab fa-notion"></i>
          </div>
          <h3>Notion</h3>
          <p>Tus apuntes y bases de conocimiento</p>
          <div class="card-actions">
            <button class="btn-conectar" (click)="toastr.info('Próximamente disponible')">
              <i class="fab fa-notion"></i> Próximamente
            </button>
          </div>
        </div>

        <!-- Microsoft Teams -->
        <div class="conexion-card">
          <div class="card-icon teams">
            <i class="fab fa-microsoft"></i>
          </div>
          <h3>Microsoft Teams</h3>
          <p>Tareas, reuniones y archivos</p>
          <div class="card-actions">
            <button class="btn-conectar" (click)="toastr.info('Próximamente disponible')">
              <i class="fab fa-microsoft"></i> Próximamente
            </button>
          </div>
        </div>

        <!-- Moodle -->
        <div class="conexion-card">
          <div class="card-icon moodle">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <h3>Moodle</h3>
          <p>Configura tu instancia de Moodle</p>
          <div class="card-actions">
            <button class="btn-conectar" (click)="mostrarModalMoodle = true">
              <i class="fas fa-cog"></i> Configurar Moodle
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .conexiones-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .page-header { text-align: center; margin-bottom: 2rem; }
    .page-header h1 { font-size: 2rem; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .conexiones-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .conexion-card { background: white; border-radius: 1rem; padding: 1.5rem; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition: all 0.3s; }
    .conexion-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.15); }
    .card-icon { width: 70px; height: 70px; margin: 0 auto 1rem; border-radius: 1rem; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; }
    .card-icon.google { background: linear-gradient(135deg, #4285f4, #ea4335); }
    .card-icon.notion { background: #000000; }
    .card-icon.teams { background: linear-gradient(135deg, #464eb8, #7c3aed); }
    .card-icon.moodle { background: linear-gradient(135deg, #f3542c, #ff6b35); }
    .btn-conectar { background: linear-gradient(135deg, #667eea, #764ba2); border: none; padding: 0.75rem 1.5rem; border-radius: 2rem; color: white; font-weight: 500; cursor: pointer; transition: all 0.3s; }
    .btn-conectar:hover { transform: scale(1.02); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
  `]
})
export class ConexionesComponent {
  mostrarModalMoodle = false;
  constructor(public toastr: ToastrService) {}
  conectarGoogle() { this.toastr.info('Redirigiendo a Google...'); }
}