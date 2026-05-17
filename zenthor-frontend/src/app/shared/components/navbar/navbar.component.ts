import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled" [class.menu-open]="mobileMenuOpen">
      <!-- Logo -->
      <div class="navbar-brand" routerLink="/dashboard">
        <div class="logo-icon">
          <i class="fas fa-brain"></i>
        </div>
        <span class="brand-name">ZENTHOR</span>
        <span class="brand-badge">Enterprise</span>
      </div>

      <!-- Desktop Navigation -->
      <div class="navbar-links desktop-menu">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
          <i class="fas fa-chart-line"></i>
          <span>Dashboard</span>
        </a>
        <a routerLink="/materias" routerLinkActive="active" class="nav-link">
          <i class="fas fa-book"></i>
          <span>Materias</span>
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

        <!-- Dropdown IA -->
        <div class="dropdown" (mouseenter)="openDropdown('ia')" (mouseleave)="closeDropdown('ia')">
          <a class="nav-link dropdown-toggle">
            <i class="fas fa-robot"></i>
            <span>Inteligencia IA</span>
            <i class="fas fa-chevron-down"></i>
          </a>
          <div class="dropdown-menu" [class.show]="activeDropdown === 'ia'">
            <a routerLink="/chat-ia" class="dropdown-item">
              <i class="fas fa-comment-dots"></i>
              <div>
                <strong>Chat IA</strong>
                <small>Resuelve tus dudas al instante</small>
              </div>
            </a>
            <a routerLink="/documentos" class="dropdown-item">
              <i class="fas fa-file-alt"></i>
              <div>
                <strong>Documentos IA</strong>
                <small>Sube y vectoriza tus apuntes</small>
              </div>
            </a>
            <a routerLink="/conexiones" class="dropdown-item">
              <i class="fas fa-plug"></i>
              <div>
                <strong>Conexiones</strong>
                <small>Google, Notion, Moodle</small>
              </div>
            </a>
          </div>
        </div>

        <a routerLink="/configuracion" routerLinkActive="active" class="nav-link">
          <i class="fas fa-cog"></i>
          <span>Configuración</span>
        </a>
      </div>

      <!-- Right Section -->
      <div class="navbar-right">
        <!-- Notificaciones -->
        <div class="notification-btn" (click)="toggleNotifications()">
          <i class="fas fa-bell"></i>
          <span class="badge" *ngIf="notificationCount > 0">{{ notificationCount }}</span>
        </div>

        <!-- User Menu -->
        <div class="user-menu" (click)="toggleUserMenu()">
          <div class="user-avatar">
            {{ getUserInitials() }}
          </div>
          <span class="user-name">{{ currentUser?.nombre_completo?.split(' ')[0] || 'Usuario' }}</span>
          <i class="fas fa-chevron-down" [class.rotated]="userMenuOpen"></i>
        </div>

        <!-- Dropdown User -->
        <div class="dropdown-user" [class.show]="userMenuOpen">
          <div class="user-header">
            <div class="user-avatar-lg">{{ getUserInitials() }}</div>
            <div class="user-info">
              <h4>{{ currentUser?.nombre_completo || 'Usuario' }}</h4>
              <p>{{ currentUser?.email || 'usuario@zenthor.com' }}</p>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <a routerLink="/perfil" class="dropdown-item" (click)="closeMenus()">
            <i class="fas fa-user-circle"></i> Mi Perfil
          </a>
          <a routerLink="/configuracion" class="dropdown-item" (click)="closeMenus()">
            <i class="fas fa-cog"></i> Configuración
          </a>
          <a routerLink="/notificaciones" class="dropdown-item" (click)="closeMenus()">
            <i class="fas fa-bell"></i> Notificaciones
          </a>
          <div class="dropdown-divider"></div>
          <button (click)="logout()" class="dropdown-item logout">
            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" (click)="toggleMobileMenu()">
          <i class="fas" [class.fa-bars]="!mobileMenuOpen" [class.fa-times]="mobileMenuOpen"></i>
        </button>
      </div>

      <!-- Mobile Menu Overlay -->
      <div class="mobile-overlay" *ngIf="mobileMenuOpen" (click)="closeMobileMenu()"></div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" [class.open]="mobileMenuOpen">
        <div class="mobile-user-section">
          <div class="mobile-user-avatar">{{ getUserInitials() }}</div>
          <div class="mobile-user-info">
            <h3>{{ currentUser?.nombre_completo || 'Usuario' }}</h3>
            <p>{{ currentUser?.email || 'usuario@zenthor.com' }}</p>
          </div>
        </div>

        <div class="mobile-nav-items">
          <a routerLink="/dashboard" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fas fa-chart-line"></i> Dashboard
          </a>
          <a routerLink="/materias" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fas fa-book"></i> Materias
          </a>
          <a routerLink="/tareas" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fas fa-tasks"></i> Tareas
          </a>
          <a routerLink="/examenes" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fas fa-calendar-alt"></i> Exámenes
          </a>
          <a routerLink="/calendario" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fas fa-calendar-week"></i> Calendario
          </a>

          <div class="mobile-divider">Inteligencia IA</div>

          <a routerLink="/chat-ia" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fas fa-robot"></i> Chat IA
          </a>
          <a routerLink="/documentos" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fas fa-file-alt"></i> Documentos IA
          </a>
          <a routerLink="/conexiones" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fas fa-plug"></i> Conexiones
          </a>

          <div class="mobile-divider"></div>

          <a routerLink="/configuracion" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fas fa-cog"></i> Configuración
          </a>
          <a routerLink="/notificaciones" routerLinkActive="active" (click)="closeMobileMenu()">
            <i class="fas fa-bell"></i> Notificaciones
          </a>
        </div>

        <button class="mobile-logout" (click)="logout()">
          <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
        </button>
      </div>
    </nav>

    <!-- Main Content Wrapper (para ajustar el padding-top) -->
    <div class="content-wrapper">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    /* ============================================
       NAVBAR PRINCIPAL - Estilo Profesional
       ============================================ */

    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #2e1065 100%);
      padding: 0 clamp(1.5rem, 5vw, 2.5rem);
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      transition: all 0.3s ease;
    }

    .navbar.scrolled {
      height: 60px;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      backdrop-filter: blur(10px);
    }

    /* Brand / Logo */
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .navbar-brand:hover {
      transform: scale(1.02);
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
    }

    .logo-icon i {
      font-size: 1.5rem;
      color: white;
    }

    .brand-name {
      font-size: 1.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .brand-badge {
      font-size: 0.7rem;
      background: rgba(102, 126, 234, 0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 20px;
      color: #a78bfa;
      font-weight: 500;
      border: 1px solid rgba(167, 139, 250, 0.3);
    }

    /* Desktop Navigation Links */
    .navbar-links {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex: 1;
      justify-content: center;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.3s ease;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .nav-link i {
      font-size: 1rem;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      transform: translateY(-2px);
    }

    .nav-link.active {
      background: rgba(102, 126, 234, 0.3);
      color: white;
    }

    /* Dropdown */
    .dropdown {
      position: relative;
    }

    .dropdown-toggle {
      cursor: pointer;
    }

    .dropdown-toggle i.fa-chevron-down {
      font-size: 0.7rem;
      margin-left: 0.25rem;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      border-radius: 16px;
      min-width: 260px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      z-index: 100;
      padding: 0.5rem;
    }

    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(10px);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      color: #1f2937;
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.2s;
    }

    .dropdown-item i {
      width: 24px;
      font-size: 1.125rem;
      color: #667eea;
    }

    .dropdown-item div {
      display: flex;
      flex-direction: column;
    }

    .dropdown-item strong {
      font-size: 0.875rem;
    }

    .dropdown-item small {
      font-size: 0.7rem;
      color: #6b7280;
    }

    .dropdown-item:hover {
      background: #f3f4f6;
      transform: translateX(4px);
    }

    /* Right Section */
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      position: relative;
    }

    /* Notification Button */
    .notification-btn {
      position: relative;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .notification-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: scale(1.05);
    }

    .notification-btn i {
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ef4444;
      color: white;
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.125rem 0.375rem;
      border-radius: 20px;
    }

    /* User Menu */
    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 40px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .user-menu:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #667eea, #8b5cf6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-name {
      color: white;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .fa-chevron-down {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      transition: transform 0.3s;
    }

    .fa-chevron-down.rotated {
      transform: rotate(180deg);
    }

    /* Dropdown User */
    .dropdown-user {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 20px;
      min-width: 300px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      z-index: 100;
      margin-top: 0.75rem;
    }

    .dropdown-user.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .user-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-radius: 20px 20px 0 0;
    }

    .user-avatar-lg {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #667eea, #8b5cf6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 1.125rem;
    }

    .user-info h4 {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1f2937;
    }

    .user-info p {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .dropdown-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 0.25rem 0;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #374151;
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
      width: 100%;
      background: none;
      border: none;
      font-size: 0.875rem;
    }

    .dropdown-item i {
      width: 20px;
      color: #667eea;
    }

    .dropdown-item:hover {
      background: #f3f4f6;
    }

    .logout {
      color: #ef4444;
    }

    .logout i {
      color: #ef4444;
    }

    .logout:hover {
      background: #fee2e2;
    }

    /* Mobile Menu Button */
    .mobile-menu-btn {
      display: none;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      font-size: 1.25rem;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .mobile-menu-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Mobile Overlay */
    .mobile-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 998;
    }

    /* Mobile Menu */
    .mobile-menu {
      position: fixed;
      top: 0;
      right: -100%;
      width: 85%;
      max-width: 320px;
      height: 100%;
      background: white;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
      transition: right 0.3s ease;
      z-index: 999;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    .mobile-menu.open {
      right: 0;
    }

    .mobile-user-section {
      padding: 2rem 1.5rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .mobile-user-avatar {
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.5rem;
    }

    .mobile-user-info h3 {
      margin: 0;
      font-size: 1rem;
      color: white;
    }

    .mobile-user-info p {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .mobile-nav-items {
      flex: 1;
      padding: 1rem;
    }

    .mobile-nav-items a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      color: #374151;
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.2s;
      font-weight: 500;
    }

    .mobile-nav-items a i {
      width: 24px;
      color: #667eea;
    }

    .mobile-nav-items a:hover,
    .mobile-nav-items a.active {
      background: #f3f4f6;
    }

    .mobile-divider {
      padding: 0.75rem 1rem;
      font-size: 0.7rem;
      font-weight: 600;
      color: #9ca3af;
      letter-spacing: 0.5px;
      margin-top: 0.5rem;
    }

    .mobile-logout {
      margin: 1rem;
      padding: 0.875rem;
      background: #fee2e2;
      border: none;
      border-radius: 12px;
      color: #ef4444;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    /* Content Wrapper */
    .content-wrapper {
      padding-top: 70px;
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .desktop-menu {
        display: none;
      }
      
      .mobile-menu-btn {
        display: block;
      }
      
      .user-name {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 0 1rem;
      }
      
      .brand-badge {
        display: none;
      }
      
      .brand-name {
        font-size: 1.25rem;
      }
      
      .logo-icon {
        width: 35px;
        height: 35px;
      }
      
      .logo-icon i {
        font-size: 1.25rem;
      }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: any;
  mobileMenuOpen = false;
  userMenuOpen = false;
  activeDropdown: string | null = null;
  notificationCount = 3;
  isScrolled = false;
  private clickListener: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    
    this.clickListener = this.handleClickOutside.bind(this);
    document.addEventListener('click', this.clickListener);
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.clickListener);
    window.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  handleScroll() {
    this.isScrolled = window.scrollY > 50;
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

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  openDropdown(name: string) {
    this.activeDropdown = name;
  }

  closeDropdown(name: string) {
    if (this.activeDropdown === name) {
      this.activeDropdown = null;
    }
  }

  closeMenus() {
    this.userMenuOpen = false;
    this.activeDropdown = null;
  }

  toggleNotifications() {
    // Implementar notificaciones
    console.log('Abrir notificaciones');
  }

  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu') && !target.closest('.dropdown-user')) {
      this.userMenuOpen = false;
    }
  }

  logout() {
    this.closeMobileMenu();
    this.authService.logout();
  }
}