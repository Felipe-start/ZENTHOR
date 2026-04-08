import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Zenthor - Organiza tu vida académica';
  isSidebarCollapsed = false;
  private sidebarEventListener: ((event: CustomEvent) => void) | null = null;

  constructor(public authService: AuthService, private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnInit() {
    // Cargar estado del sidebar desde localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    this.isSidebarCollapsed = savedState === 'true';
    
    // Escuchar cambios del sidebar
    this.sidebarEventListener = ((event: Event) => {
      const customEvent = event as CustomEvent;
      this.isSidebarCollapsed = customEvent.detail.collapsed;
    }) as EventListener;
    
    window.addEventListener('sidebarToggle', this.sidebarEventListener as EventListener);
  }

  ngOnDestroy() {
    if (this.sidebarEventListener) {
      window.removeEventListener('sidebarToggle', this.sidebarEventListener as EventListener);
    }
  }
}