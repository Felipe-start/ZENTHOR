import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar" [class.menu-open]="mobileMenuOpen">
      <div class="navbar-brand">
        <div class="logo-container" routerLink="/dashboard">
          <img src="assets/images/LOGO Z.jpg" alt="ZENTHOR" class="logo-img" (error)="handleImageError($event)">
          <span class="brand-name">ZENTHOR</span>
        </div>
        <button class="mobile-menu-btn" (click)="toggleMobileMenu()" aria-label="Menú">
          <i class="fas" [class.fa-bars]="!mobileMenuOpen" [class.fa-times]="mobileMenuOpen"></i>
        </button>
      </div>
      
      <div class="navbar-menu" [class.active]="mobileMenuOpen">
        <div class="navbar-start">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <i class="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </a>
          <a routerLink="/materias" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <i class="fas fa-book"></i>
            <span>Materias</span>
          </a>
          <a routerLink="/tareas" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <i class="fas fa-tasks"></i>
            <span>Tareas</span>
          </a>
          <a routerLink="/examenes" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <i class="fas fa-calendar-alt"></i>
            <span>Exámenes</span>
          </a>
          <a routerLink="/calendario" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <i class="fas fa-calendar-week"></i>
            <span>Calendario</span>
          </a>
          <a routerLink="/configuracion" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <i class="fas fa-cog"></i>
            <span>Configuración</span>
          </a>
        </div>
        
        <div class="navbar-end">
          <app-notification-bell></app-notification-bell>
          
          <div class="user-menu" (click)="toggleUserMenu()">
            <div class="user-avatar">
              {{ getUserInitials() }}
            </div>
            <span class="user-name">{{ currentUser?.nombre_completo?.split(' ')[0] || 'Usuario' }}</span>
            <i class="fas fa-chevron-down" [class.rotated]="userMenuOpen"></i>
          </div>
          <div class="dropdown-menu" [class.show]="userMenuOpen">
            <a routerLink="/perfil" class="dropdown-item" (click)="closeMobileMenu()">
              <i class="fas fa-user-circle"></i>
              <span>Mi Perfil</span>
            </a>
            <div class="dropdown-divider"></div>
            <button (click)="logout()" class="dropdown-item logout">
              <i class="fas fa-sign-out-alt"></i>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    /* ============================================
       NAVBAR - Fully Responsive Styles
       ============================================ */
    
    .navbar {
      background: linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #4c1d95 100%);
      padding: 0 clamp(1rem, 4vw, 1.75rem);
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      position: sticky;
      top: 0;
      z-index: 1000;
      transition: all 0.3s ease;
    }
    
    /* Navbar Brand */
    .navbar-brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
      flex-shrink: 0;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    
    .logo-container:hover {
      transform: scale(1.02);
    }
    
    .logo-img {
      width: clamp(35px, 8vw, 45px);
      height: clamp(35px, 8vw, 45px);
      border-radius: clamp(10px, 3vw, 12px);
      object-fit: cover;
      transition: all 0.3s ease;
    }
    
    .brand-name {
      font-size: clamp(1.125rem, 5vw, 1.5rem);
      font-weight: 800;
      background: linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* Mobile Menu Button */
    .mobile-menu-btn {
      display: none;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      font-size: clamp(1rem, 4vw, 1.25rem);
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      transition: all 0.3s ease;
    }
    
    .mobile-menu-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    /* Navbar Menu */
    .navbar-menu {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      margin-left: 2rem;
      transition: all 0.3s ease;
    }
    
    .navbar-start {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.3s ease;
      font-weight: 500;
      font-size: clamp(0.75rem, 3vw, 0.875rem);
      white-space: nowrap;
    }
    
    .nav-item i {
      font-size: clamp(0.875rem, 3vw, 1rem);
    }
    
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      transform: translateY(-2px);
    }
    
    .nav-item.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    /* Navbar End */
    .navbar-end {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      padding: 0.5rem 1rem;
      border-radius: 40px;
      background: rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
    }
    
    .user-menu:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .user-avatar {
      width: clamp(32px, 8vw, 36px);
      height: clamp(32px, 8vw, 36px);
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: clamp(0.875rem, 3vw, 1rem);
      flex-shrink: 0;
    }
    
    .user-name {
      color: white;
      font-weight: 500;
      font-size: clamp(0.75rem, 3vw, 0.875rem);
    }
    
    .fa-chevron-down {
      transition: transform 0.3s ease;
      color: rgba(255, 255, 255, 0.7);
      font-size: clamp(0.688rem, 2.5vw, 0.75rem);
    }
    
    .fa-chevron-down.rotated {
      transform: rotate(180deg);
    }
    
    /* Dropdown Menu */
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: clamp(0.75rem, 3vw, 1rem);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 1000;
    }
    
    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(10px);
    }
    
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      color: #374151;
      text-decoration: none;
      width: 100%;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }
    
    .dropdown-item:hover {
      background: #f3f4f6;
      color: #6366f1;
    }
    
    .dropdown-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 0.25rem 0;
    }
    
    .logout {
      color: #ef4444;
    }
    
    .logout:hover {
      background: #fee2e2;
      color: #dc2626;
    }
    
    /* Desktop Adjustments */
    @media (max-width: 1024px) {
      .navbar-start {
        gap: 0.125rem;
      }
      
      .nav-item span {
        display: none;
      }
      
      .nav-item i {
        margin: 0;
      }
      
      .nav-item {
        padding: 0.5rem 0.75rem;
      }
      
      .user-name {
        display: none;
      }
    }
    
    /* Mobile Styles */
    @media (max-width: 768px) {
      .navbar {
        padding: 0 1rem;
      }
      
      .logo-img {
        width: 35px;
        height: 35px;
      }
      
      .brand-name {
        font-size: 1.125rem;
      }
      
      .mobile-menu-btn {
        display: block;
      }
      
      .navbar-menu {
        position: fixed;
        top: 70px;
        left: -100%;
        width: 100%;
        height: calc(100vh - 70px);
        background: linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%);
        flex-direction: column;
        margin-left: 0;
        transition: left 0.3s ease;
        padding: 1rem;
        z-index: 999;
        overflow-y: auto;
      }
      
      .navbar-menu.active {
        left: 0;
      }
      
      .navbar-start {
        flex-direction: column;
        width: 100%;
      }
      
      .nav-item {
        padding: 0.875rem 1rem;
        width: 100%;
        justify-content: flex-start;
      }
      
      .nav-item span {
        display: inline;
      }
      
      .navbar-end {
        width: 100%;
        margin-top: 1rem;
        flex-direction: column;
      }
      
      .user-menu {
        width: 100%;
        justify-content: center;
        padding: 0.75rem;
      }
      
      .user-name {
        display: inline;
      }
      
      .dropdown-menu {
        position: static;
        width: 100%;
        margin-top: 0.5rem;
        box-shadow: none;
        background: rgba(255, 255, 255, 0.1);
      }
      
      .dropdown-item {
        color: white;
      }
      
      .dropdown-item:hover {
        background: rgba(255, 255, 255, 0.15);
        color: white;
      }
      
      .dropdown-divider {
        background: rgba(255, 255, 255, 0.2);
      }
    }
    
    @media (max-width: 480px) {
      .navbar {
        height: 60px;
      }
      
      .navbar-menu {
        top: 60px;
        height: calc(100vh - 60px);
      }
      
      .nav-item {
        padding: 0.75rem;
      }
    }
    
    /* Touch-friendly */
    @media (hover: none) and (pointer: coarse) {
      .nav-item:active {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .user-menu:active {
        background: rgba(255, 255, 255, 0.15);
      }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: any;
  mobileMenuOpen = false;
  userMenuOpen = false;
  private clickListener: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    
    // Cerrar menús al hacer click fuera
    this.clickListener = this.handleClickOutside.bind(this);
    document.addEventListener('click', this.clickListener);
    
    // Cerrar menú móvil al redimensionar a desktop
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.clickListener);
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  handleImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/45x45?text=Z';
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

  toggleMobileMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
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

  toggleUserMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.userMenuOpen = !this.userMenuOpen;
  }

  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu') && !target.closest('.dropdown-menu')) {
      this.userMenuOpen = false;
    }
  }

  handleResize() {
    if (window.innerWidth > 768 && this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  logout() {
    this.closeMobileMenu();
    this.authService.logout();
  }
}