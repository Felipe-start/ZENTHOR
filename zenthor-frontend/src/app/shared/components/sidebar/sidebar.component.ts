import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed" [class.open]="mobileOpen">
      <!-- Overlay para móvil -->
      <div class="sidebar-overlay" *ngIf="mobileOpen" (click)="closeMobile()"></div>
      
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
            <h4>{{ currentUser?.nombre_completo || 'Usuario' }}</h4>
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
    /* ============================================
       SIDEBAR - Fully Responsive Styles
       ============================================ */
    
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
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease;
      overflow-x: hidden;
      overflow-y: auto;
    }
    
    .sidebar.collapsed {
      width: 80px;
    }
    
    /* Overlay para móvil */
    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: -1;
    }
    
    /* Sidebar Header */
    .sidebar-header {
      padding: clamp(1rem, 4vw, 1.5rem);
      border-bottom: 1px solid #eef2f6;
      transition: all 0.3s ease;
    }
    
    .sidebar.collapsed .sidebar-header {
      padding: 1rem 0.75rem;
    }
    
    .logo-wrapper {
      text-align: center;
      margin-bottom: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .logo-wrapper:hover {
      transform: scale(1.02);
    }
    
    .sidebar-logo {
      width: clamp(50px, 12vw, 70px);
      height: clamp(50px, 12vw, 70px);
      border-radius: clamp(14px, 4vw, 18px);
      object-fit: cover;
      margin-bottom: 0.75rem;
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
      transition: all 0.3s ease;
    }
    
    .sidebar.collapsed .sidebar-logo {
      width: 45px;
      height: 45px;
      margin-bottom: 0;
    }
    
    .logo-text {
      font-size: clamp(1rem, 4vw, 1.25rem);
      font-weight: 700;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      transition: all 0.3s ease;
    }
    
    .sidebar.collapsed .logo-text {
      display: none;
    }
    
    /* User Info */
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
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
      width: clamp(48px, 12vw, 56px);
      height: clamp(48px, 12vw, 56px);
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: clamp(1rem, 4vw, 1.25rem);
      font-weight: 600;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }
    
    .user-avatar-sm {
      width: 45px;
      height: 45px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      margin: 0 auto;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .user-avatar-sm:hover {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
    }
    
    .user-details {
      flex: 1;
      min-width: 0;
    }
    
    .user-details h4 {
      margin: 0;
      font-size: clamp(0.875rem, 3.5vw, 1rem);
      font-weight: 600;
      color: #1f2937;
      word-break: break-word;
    }
    
    .user-details p {
      margin: 0.25rem 0 0;
      font-size: clamp(0.688rem, 2.5vw, 0.75rem);
      color: #6b7280;
    }
    
    /* Sidebar Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .sidebar.collapsed .sidebar-nav {
      padding: 1.25rem 0.5rem;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
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
      font-size: clamp(1rem, 3.5vw, 1.125rem);
      position: relative;
      z-index: 1;
    }
    
    .nav-link span {
      position: relative;
      z-index: 1;
      font-size: clamp(0.813rem, 3vw, 0.875rem);
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
      padding: 0.75rem;
    }
    
    .sidebar.collapsed .nav-link i {
      margin: 0;
    }
    
    /* Sidebar Footer */
    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid #eef2f6;
    }
    
    .progress-section {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 16px;
    }
    
    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: clamp(0.688rem, 2.5vw, 0.75rem);
      color: #4b5563;
      margin-bottom: 0.625rem;
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
    
    /* Sidebar Toggle */
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
    
    /* Animations */
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    
    /* Scrollbar */
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
    
    /* Mobile Styles */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        width: 280px !important;
        top: 60px;
        height: calc(100vh - 60px);
        z-index: 1000;
      }
      
      .sidebar.open {
        transform: translateX(0);
      }
      
      .sidebar.open .sidebar-overlay {
        display: block;
      }
      
      .sidebar-toggle {
        display: none;
      }
      
      .sidebar.collapsed {
        width: 280px !important;
      }
    }
    
    @media (min-width: 769px) {
      .sidebar-overlay {
        display: none !important;
      }
    }
    
    /* Touch-friendly */
    @media (hover: none) and (pointer: coarse) {
      .nav-link:active {
        transform: translateX(2px);
      }
      
      .user-avatar-sm:active {
        transform: scale(0.98);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  currentUser: any;
  isCollapsed = false;
  mobileOpen = false;
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
    
    // Escuchar evento de toggle del navbar para cerrar en móvil
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  handleImageError(event: any) {
    event.target.src = '';
  }

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.mobileOpen = !this.mobileOpen;
    } else {
      this.isCollapsed = !this.isCollapsed;
      localStorage.setItem('sidebarCollapsed', String(this.isCollapsed));
      
      // Emitir evento global para que el contenido se ajuste
      window.dispatchEvent(new CustomEvent('sidebarToggle', { 
        detail: { collapsed: this.isCollapsed } 
      }));
    }
  }

  closeMobile() {
    if (window.innerWidth <= 768) {
      this.mobileOpen = false;
    }
  }
  
  handleResize() {
    if (window.innerWidth > 768 && this.mobileOpen) {
      this.mobileOpen = false;
    }
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