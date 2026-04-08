import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <img src="assets/images/LOGO.jpg" alt="ZENTHOR" class="footer-logo" (error)="handleImageError($event)">
          <span>ZENTHOR</span>
        </div>
        <p>&copy; {{ currentYear }} ZENTHOR. Todos los derechos reservados.</p>
        <div class="footer-links">
          <a href="#" class="footer-link">Términos</a>
          <span class="separator">•</span>
          <a href="#" class="footer-link">Privacidad</a>
          <span class="separator">•</span>
          <a href="#" class="footer-link">Contacto</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 20px 24px;
      margin-top: auto;
      width: 100%;
    }
    
    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: #9ca3af;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .footer-logo {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      object-fit: cover;
    }
    
    .footer-brand span {
      font-weight: 600;
      background: linear-gradient(135deg, #a78bfa, #c4b5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .footer-links {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .footer-link {
      color: #9ca3af;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    
    .footer-link:hover {
      color: #a78bfa;
      transform: translateY(-2px);
    }
    
    .separator {
      color: #4b5563;
    }
    
    @media (max-width: 768px) {
      .footer {
        padding: 16px 20px;
      }
      
      .footer-content {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }
      
      .footer-links {
        justify-content: center;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  handleImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/30x30?text=Z';
  }
}