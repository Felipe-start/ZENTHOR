import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
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