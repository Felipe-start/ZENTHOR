import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <div class="logo-container">
          <img src="assets/logo.svg" alt="Zenthor Logo" class="logo">
          <span class="brand-name">ZENTHOR</span>
        </div>
        <button class="mobile-menu-btn" (click)="toggleMobileMenu()">
          <i class="fas fa-bars"></i>
        </button>
      </div>
      
      <div class="navbar-menu" [class.active]="mobileMenuOpen">
        <div class="navbar-start">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <i class="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </a>
          <a routerLink="/materias" routerLinkActive="active" class="nav-item">
            <i class="fas fa-book"></i>
            <span>Materias</span>
          </a>
          <a routerLink="/tareas" routerLinkActive="active" class="nav-item">
            <i class="fas fa-tasks"></i>
            <span>Tareas</span>
          </a>
          <a routerLink="/examenes" routerLinkActive="active" class="nav-item">
            <i class="fas fa-calendar-alt"></i>
            <span>Exámenes</span>
          </a>
          <a routerLink="/calendario" routerLinkActive="active" class="nav-item">
            <i class="fas fa-calendar-week"></i>
            <span>Calendario</span>
          </a>
          <a routerLink="/configuracion" routerLinkActive="active" class="nav-item">
            <i class="fas fa-cog"></i>
            <span>Configuración</span>
          </a>
        </div>
        
        <div class="navbar-end">
          <div class="user-menu" (click)="toggleUserMenu()">
            <div class="user-avatar">
              {{ getUserInitials() }}
            </div>
            <span class="user-name">{{ currentUser?.nombre_completo?.split(' ')[0] || 'Usuario' }}</span>
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="dropdown-menu" [class.show]="userMenuOpen">
            <a routerLink="/perfil" class="dropdown-item">
              <i class="fas fa-user"></i>
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
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 0 24px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo {
      height: 40px;
      width: auto;
    }
    .brand-name {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #fff 0%, #a0a0ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 1px;
    }
    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
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
      padding: 8px 16px;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      font-weight: 500;
    }
    .nav-item i {
      font-size: 18px;
    }
    .nav-item:hover, .nav-item.active {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    .navbar-end {
      position: relative;
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 40px;
      transition: all 0.3s ease;
    }
    .user-menu:hover {
      background: rgba(255,255,255,0.1);
    }
    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
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
      gap: 12px;
      padding: 12px 20px;
      color: #333;
      text-decoration: none;
      transition: background 0.3s ease;
      width: 100%;
      background: none;
      border: none;
      cursor: pointer;
    }
    .dropdown-item:hover {
      background: #f5f5f5;
    }
    .dropdown-divider {
      height: 1px;
      background: #e0e0e0;
      margin: 8px 0;
    }
    .logout {
      color: #dc3545;
    }
    @media (max-width: 768px) {
      .navbar {
        padding: 0 16px;
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
        background: #1a1a2e;
        flex-direction: column;
        justify-content: flex-start;
        margin-left: 0;
        transition: left 0.3s ease;
        overflow-y: auto;
        padding: 20px;
      }
      .navbar-menu.active {
        left: 0;
      }
      .navbar-start {
        flex-direction: column;
        width: 100%;
      }
      .nav-item {
        padding: 12px 16px;
      }
      .navbar-end {
        width: 100%;
        margin-top: 20px;
      }
      .user-menu {
        justify-content: center;
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
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout() {
    this.authService.logout();
  }
}