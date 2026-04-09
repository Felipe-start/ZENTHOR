import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <div class="logo-container" routerLink="/dashboard">
          <img src="assets/images/ LOGO Z.jpg" alt="ZENTHOR" class="logo-img" (error)="handleImageError($event)">
          <span class="brand-name">ZENTHOR</span>
        </div>
        <button class="mobile-menu-btn" (click)="toggleMobileMenu()">
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
          <!-- CAMPANA DE NOTIFICACIONES -->
          <app-notification-bell></app-notification-bell>
          
          <div class="user-menu" (click)="toggleUserMenu()">
            <div class="user-avatar">
              {{ getUserInitials() }}
            </div>
            <span class="user-name">{{ currentUser?.nombre_completo?.split(' ')[0] || 'Usuario' }}</span>
            <i class="fas fa-chevron-down" [class.rotated]="userMenuOpen"></i>
          </div>
          <div class="dropdown-menu" [class.show]="userMenuOpen">
            <a routerLink="/perfil" class="dropdown-item">
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
    .navbar {
      background: linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #4c1d95 100%);
      padding: 0 28px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .navbar-brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }
    
    .logo-img {
      width: 45px;
      height: 45px;
      border-radius: 12px;
      object-fit: cover;
    }
    
    .brand-name {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .mobile-menu-btn {
      display: none;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 12px;
    }
    
    .navbar-menu {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      margin-left: 48px;
    }
    
    .navbar-start {
      display: flex;
      gap: 8px;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.3s ease;
      font-weight: 500;
    }
    
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.15);
      color: white;
    }
    
    .nav-item.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    .navbar-end {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .user-menu {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 40px;
      background: rgba(255, 255, 255, 0.05);
    }
    
    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
    }
    
    .user-name {
      color: white;
      font-weight: 500;
    }
    
    .fa-chevron-down {
      transition: transform 0.3s ease;
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
    }
    
    .fa-chevron-down.rotated {
      transform: rotate(180deg);
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      min-width: 220px;
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
      gap: 12px;
      padding: 12px 20px;
      color: #374151;
      text-decoration: none;
      width: 100%;
      background: none;
      border: none;
      cursor: pointer;
    }
    
    .dropdown-item:hover {
      background: #f3f4f6;
      color: #6366f1;
    }
    
    .logout {
      color: #ef4444;
    }
    
    @media (max-width: 1024px) {
      .nav-item span {
        font-size: 13px;
      }
      .user-name {
        display: none;
      }
    }
    
    @media (max-width: 768px) {
      .navbar {
        padding: 0 16px;
      }
      
      .logo-img {
        width: 35px;
        height: 35px;
      }
      
      .brand-name {
        font-size: 20px;
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
        padding: 20px;
        z-index: 999;
      }
      
      .navbar-menu.active {
        left: 0;
      }
      
      .navbar-start {
        flex-direction: column;
        width: 100%;
      }
      
      .nav-item {
        padding: 14px 16px;
        width: 100%;
      }
      
      .navbar-end {
        width: 100%;
        margin-top: 20px;
      }
      
      .user-menu {
        justify-content: center;
        width: 100%;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: any;
  mobileMenuOpen = false;
  userMenuOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
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

  logout() {
    this.closeMobileMenu();
    this.authService.logout();
  }
}
