import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 ZENTHOR. Todos los derechos reservados.</p>
        <div class="footer-links">
          <a href="#">Términos</a>
          <a href="#">Privacidad</a>
          <a href="#">Contacto</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: white;
      border-top: 1px solid #eef2f6;
      padding: 20px 24px;
      margin-top: auto;
    }
    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: #7f8c8d;
    }
    .footer-links {
      display: flex;
      gap: 24px;
    }
    .footer-links a {
      color: #7f8c8d;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    .footer-links a:hover {
      color: #667eea;
    }
    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}