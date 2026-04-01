import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="user-info">
          <div class="user-avatar-lg">
            {{ getUserInitials() }}
          </div>
          <div class="user-details">
            <h4>{{ currentUser?.nombre_completo }}</h4>
            <p>{{ currentUser?.nivel_educativo || 'Estudiante' }}</p>
          </div>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
          <i class="fas fa-chart-line"></i>
          <span>Dashboard</span>
        </a>
        <a routerLink="/materias" routerLinkActive="active" class="nav-link">
          <i class="fas fa-book"></i>
          <span>Mis Materias</span>
        </a>
        <a routerLink="/tareas" routerLinkActive="active" class="nav-link">
          <i class="fas fa-tasks"></i>
          <span>Tareas</span>
        </a>
        <a routerLink="/examenes" routerLinkActive="active" class="nav-link">
          <i class="fas fa-calendar-alt"></i>
          <span>Exámenes</span>
        </a>
        <a routerLink="/calendario" routerLinkActive="active" class="nav-link">
          <i class="fas fa-calendar-week"></i>
          <span>Calendario</span>
        </a>
        <a routerLink="/configuracion" routerLinkActive="active" class="nav-link">
          <i class="fas fa-cog"></i>
          <span>Configuración</span>
        </a>
      </nav>
      
      <div class="sidebar-footer">
        <div class="progress-section">
          <div class="progress-label">
            <span>Progreso Académico</span>
            <span>75%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 75%"></div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 70px;
      width: 280px;
      height: calc(100vh - 70px);
      background: white;
      box-shadow: 2px 0 10px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      z-index: 99;
    }
    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid #eef2f6;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .user-avatar-lg {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      font-weight: 600;
    }
    .user-details h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }
    .user-details p {
      margin: 4px 0 0;
      font-size: 12px;
      color: #7f8c8d;
    }
    .sidebar-nav {
      flex: 1;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #4a5568;
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.3s ease;
      font-weight: 500;
    }
    .nav-link i {
      width: 24px;
      font-size: 18px;
    }
    .nav-link:hover {
      background: #f7fafc;
      color: #667eea;
    }
    .nav-link.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .sidebar-footer {
      padding: 24px;
      border-top: 1px solid #eef2f6;
    }
    .progress-section {
      background: #f7fafc;
      padding: 12px;
      border-radius: 12px;
    }
    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #4a5568;
      margin-bottom: 8px;
    }
    .progress-bar {
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      .sidebar.open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  currentUser: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  getUserInitials(): string {
    if (this.currentUser?.nombre_completo) {
      return this.currentUser.nombre_completo
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  }
}