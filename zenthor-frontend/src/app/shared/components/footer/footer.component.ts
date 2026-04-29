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
    /* ============================================
       FOOTER - Fully Responsive Styles
       ============================================ */
    
    .footer {
      background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: clamp(1rem, 4vw, 1.25rem) clamp(1rem, 4vw, 1.5rem);
      margin-top: auto;
      width: 100%;
      position: relative;
      z-index: 10;
    }
    
    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: clamp(0.75rem, 3vw, 0.875rem);
      color: #9ca3af;
      flex-wrap: wrap;
      gap: clamp(0.75rem, 3vw, 1rem);
    }
    
    .footer-brand {
      display: flex;
      align-items: center;
      gap: clamp(0.5rem, 3vw, 0.625rem);
    }
    
    .footer-logo {
      width: clamp(28px, 8vw, 32px);
      height: clamp(28px, 8vw, 32px);
      border-radius: clamp(6px, 2vw, 8px);
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    .footer-logo:hover {
      transform: scale(1.05);
    }
    
    .footer-brand span {
      font-weight: 600;
      background: linear-gradient(135deg, #a78bfa, #c4b5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: clamp(0.875rem, 4vw, 1rem);
    }
    
    .footer p {
      margin: 0;
      text-align: center;
    }
    
    .footer-links {
      display: flex;
      gap: clamp(0.5rem, 3vw, 0.75rem);
      align-items: center;
      flex-wrap: wrap;
    }
    
    .footer-link {
      color: #9ca3af;
      text-decoration: none;
      transition: all 0.3s ease;
      padding: 0.25rem 0;
      position: relative;
    }
    
    .footer-link::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #a78bfa, #c4b5fd);
      transition: width 0.3s ease;
    }
    
    .footer-link:hover {
      color: #a78bfa;
    }
    
    .footer-link:hover::after {
      width: 100%;
    }
    
    .separator {
      color: #4b5563;
    }
    
    /* Responsive Breakpoints */
    @media (max-width: 768px) {
      .footer {
        padding: 1rem;
      }
      
      .footer-content {
        flex-direction: column;
        text-align: center;
        gap: 0.75rem;
      }
      
      .footer-links {
        justify-content: center;
      }
    }
    
    @media (max-width: 480px) {
      .footer-content {
        gap: 0.625rem;
      }
      
      .footer-links {
        gap: 0.5rem;
      }
      
      .separator {
        display: inline-block;
      }
    }
    
    /* Touch-friendly */
    @media (hover: none) and (pointer: coarse) {
      .footer-link:active {
        color: #a78bfa;
      }
      
      .footer-logo:active {
        transform: scale(0.98);
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  handleImageError(event: any) {
    event.target.src = '';
  }
}