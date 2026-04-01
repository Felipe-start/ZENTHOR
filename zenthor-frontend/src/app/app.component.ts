import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-navbar *ngIf="authService.isAuthenticated"></app-navbar>
      <div class="main-wrapper" [class.with-sidebar]="authService.isAuthenticated">
        <app-sidebar *ngIf="authService.isAuthenticated"></app-sidebar>
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </div>
      <app-footer *ngIf="authService.isAuthenticated"></app-footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .main-wrapper {
      display: flex;
      flex: 1;
    }
    .main-wrapper.with-sidebar {
      margin-left: 280px;
    }
    .content-area {
      flex: 1;
      padding: 24px;
      background: #f8f9fa;
    }
    @media (max-width: 768px) {
      .main-wrapper.with-sidebar {
        margin-left: 0;
      }
      .content-area {
        padding: 16px;
      }
    }
  `]
})
export class AppComponent {
  title = 'Zenthor - Organiza tu vida académica';

  constructor(public authService: AuthService, private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }
}