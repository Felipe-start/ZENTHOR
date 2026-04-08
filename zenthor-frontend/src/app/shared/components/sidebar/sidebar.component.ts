import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed">
      <div class="sidebar-header">
        <div class="logo-wrapper" (click)="toggleSidebar()">
          <img src="assets/images/ LOGO Z.jpg" alt="ZENTHOR" class="sidebar-logo animate-float" (error)="handleImageError($event)">
          <h2 class="logo-text" *ngIf="!isCollapsed">ZENTHOR</h2>
        </div>

        <div class="user-info" *ngIf="!isCollapsed">
          <div class="user-avatar-lg">
            {{ getUserInitials() }}
          </div>
          <div class="user-details">
            <h4>{{ currentUser?.nombre_completo }}</h4>
            <p>{{ currentUser?.nivel_educativo || 'Estudiante' }}</p>
          </div>
        </div>
        
        <div class="user-avatar-sm" *ngIf="isCollapsed" (click)="toggleSidebar()">
          {{ getUserInitials() }}
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link" (click)="closeMobile()">
          <i class="fas fa-chart-line"></i>
          <span *ngIf="!isCollapsed">Dashboard</span>
        </a>
        <a routerLink="/materias" routerLinkActive="active" class="nav-link" (click)="closeMobile()">
          <i class="fas fa-book"></i>
          <span *ngIf="!isCollapsed">Mis Materias</span>
        </a>
        <a routerLink="/tareas" routerLinkActive="active" class="nav-link" (click)="closeMobile()">
          <i class="fas fa-tasks"></i>
          <span *ngIf="!isCollapsed">Tareas</span>
        </a>
        <a routerLink="/examenes" routerLinkActive="active" class="nav-link" (click)="closeMobile()">
          <i class="fas fa-calendar-alt"></i>
          <span *ngIf="!isCollapsed">Exámenes</span>
        </a>
        <a routerLink="/calendario" routerLinkActive="active" class="nav-link" (click)="closeMobile()">
          <i class="fas fa-calendar-week"></i>
          <span *ngIf="!isCollapsed">Calendario</span>
        </a>
        <a routerLink="/configuracion" routerLinkActive="active" class="nav-link" (click)="closeMobile()">
          <i class="fas fa-cog"></i>
          <span *ngIf="!isCollapsed">Configuración</span>
        </a>
      </nav>
      
      <div class="sidebar-footer" *ngIf="!isCollapsed">
        <div class="progress-section">
          <div class="progress-label">
            <span>Progreso Académico</span>
            <span>{{ progreso }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progreso"></div>
          </div>
        </div>
      </div>
      
      <div class="sidebar-toggle" (click)="toggleSidebar()">
        <i class="fas" [class.fa-chevron-left]="!isCollapsed" [class.fa-chevron-right]="isCollapsed"></i>
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
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      z-index: 99;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-x: hidden;
      overflow-y: auto;
    }
    
    .sidebar.collapsed {
      width: 80px;
    }
    
    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid #eef2f6;
      transition: all 0.3s ease;
    }
    
    .sidebar.collapsed .sidebar-header {
      padding: 20px 12px;
    }
    
    .logo-wrapper {
      text-align: center;
      margin-bottom: 24px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .logo-wrapper:hover {
      transform: scale(1.02);
    }
    
    .sidebar-logo {
      width: 70px;
      height: 70px;
      border-radius: 18px;
      object-fit: cover;
      margin-bottom: 12px;
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
      transition: all 0.3s ease;
    }
    
    .sidebar.collapsed .sidebar-logo {
      width: 50px;
      height: 50px;
      margin-bottom: 0;
    }
    
    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      transition: all 0.3s ease;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
      animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .user-avatar-lg {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .user-avatar-sm {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      font-weight: 600;
      margin: 0 auto;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .user-avatar-sm:hover {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
    }
    
    .user-details h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .user-details p {
      margin: 4px 0 0;
      font-size: 12px;
      color: #6b7280;
    }
    
    .sidebar-nav {
      flex: 1;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .sidebar.collapsed .sidebar-nav {
      padding: 20px 8px;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #4b5563;
      text-decoration: none;
      border-radius: 14px;
      transition: all 0.3s ease;
      font-weight: 500;
      position: relative;
      overflow: hidden;
    }
    
    .nav-link::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 0;
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      transition: width 0.3s ease;
      z-index: 0;
      opacity: 0.1;
    }
    
    .nav-link:hover::before {
      width: 100%;
    }
    
    .nav-link i {
      width: 24px;
      font-size: 18px;
      position: relative;
      z-index: 1;
    }
    
    .nav-link span {
      position: relative;
      z-index: 1;
    }
    
    .nav-link:hover {
      background: #f3f4f6;
      color: #6366f1;
      transform: translateX(4px);
    }
    
    .nav-link.active {
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    
    .sidebar.collapsed .nav-link {
      justify-content: center;
      padding: 12px;
    }
    
    .sidebar.collapsed .nav-link i {
      margin: 0;
    }
    
    .sidebar-footer {
      padding: 24px;
      border-top: 1px solid #eef2f6;
    }
    
    .progress-section {
      background: #f9fafb;
      padding: 16px;
      border-radius: 16px;
    }
    
    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #4b5563;
      margin-bottom: 10px;
      font-weight: 500;
    }
    
    .progress-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      border-radius: 10px;
      transition: width 0.5s ease;
      position: relative;
    }
    
    .progress-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: shimmer 1.5s infinite;
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    .sidebar-toggle {
      position: absolute;
      right: -12px;
      top: 50%;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .sidebar-toggle:hover {
      background: #6366f1;
      color: white;
      transform: translateY(-50%) scale(1.1);
    }
    
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    
    .sidebar::-webkit-scrollbar {
      width: 4px;
    }
    
    .sidebar::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    .sidebar::-webkit-scrollbar-thumb {
      background: #c7d2fe;
      border-radius: 4px;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        width: 280px !important;
      }
      
      .sidebar.open {
        transform: translateX(0);
      }
      
      .sidebar-toggle {
        display: none;
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  currentUser: any;
  isCollapsed = false;
  progreso = 75;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    
    const savedProgress = localStorage.getItem('academicProgress');
    if (savedProgress) {
      this.progreso = parseInt(savedProgress);
    }

    // Cargar estado del sidebar desde localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = savedState === 'true';
    }
  }

  handleImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/70x70?text=Z';
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebarCollapsed', String(this.isCollapsed));
    
    // Emitir evento global para que el contenido se ajuste
    window.dispatchEvent(new CustomEvent('sidebarToggle', { 
      detail: { collapsed: this.isCollapsed } 
    }));
  }

  closeMobile() {
    // Solo para móvil
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