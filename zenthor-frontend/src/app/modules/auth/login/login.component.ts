import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <img src="assets/logo.svg" alt="Zenthor Logo" class="logo">
          <h1>ZENTHOR</h1>
          <p>Organiza tu vida académica</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label>Correo electrónico</label>
            <div class="input-group">
              <i class="fas fa-envelope"></i>
              <input type="email" formControlName="email" placeholder="tu&#64;email.com">
            </div>
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="••••••••">
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="btn-primary" [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="!isLoading">Iniciar Sesión</span>
            <span *ngIf="isLoading" class="spinner"></span>
          </button>

          <div class="auth-footer">
            <p>¿No tienes una cuenta? <a routerLink="/register">Regístrate aquí</a></p>
          </div>
        </form>

        <div class="demo-credentials">
          <div class="demo-card" (click)="fillDemoCredentials()">
            <i class="fas fa-user-graduate"></i>
            <div>
              <strong>Usuario de prueba</strong>
              <span>luisfelipearellano2004&#64;gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .auth-card {
      background: white;
      border-radius: 32px;
      padding: 48px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      width: 80px;
      height: auto;
      margin-bottom: 16px;
    }
    .auth-header h1 {
      font-size: 32px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .form-group {
      margin-bottom: 24px;
    }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #2c3e50;
    }
    .input-group {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-group i:first-child {
      position: absolute;
      left: 16px;
      color: #95a5a6;
    }
    .input-group input {
      width: 100%;
      padding: 14px 16px 14px 48px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 16px;
    }
    .input-group input:focus {
      outline: none;
      border-color: #667eea;
    }
    .toggle-password {
      position: absolute;
      right: 16px;
      background: none;
      border: none;
      cursor: pointer;
      color: #95a5a6;
    }
    .btn-primary {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid white;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #eef2f6;
    }
    .auth-footer a {
      color: #667eea;
      text-decoration: none;
    }
    .demo-credentials {
      margin-top: 24px;
    }
    .demo-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 12px;
      cursor: pointer;
    }
    .demo-card:hover {
      background: #eef2f6;
    }
    .demo-card div {
      display: flex;
      flex-direction: column;
    }
    .demo-card span {
      font-size: 12px;
      color: #7f8c8d;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  fillDemoCredentials() {
    this.loginForm.patchValue({
      email: 'luisfelipearellano2004@gmail.com',
      password: 'demo123'
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.toastr.success('¡Bienvenido!', 'Inicio de sesión exitoso');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.toastr.error(error.message, 'Error');
        this.isLoading = false;
      }
    });
  }
}
