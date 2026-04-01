
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <img src="assets/logo.svg" alt="Zenthor Logo" class="logo">
          <h1>Crear Cuenta</h1>
          <p>Únete a ZENTHOR y organiza tu vida académica</p>
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="nombre_completo">Nombre completo</label>
            <div class="input-group">
              <i class="fas fa-user"></i>
              <input 
                type="text" 
                id="nombre_completo" 
                formControlName="nombre_completo" 
                placeholder="María García López"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <div class="input-group">
              <i class="fas fa-envelope"></i>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                placeholder="tu@email.com"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="nivel_educativo">Nivel educativo</label>
            <div class="input-group">
              <i class="fas fa-graduation-cap"></i>
              <select id="nivel_educativo" formControlName="nivel_educativo">
                <option value="">Selecciona tu nivel</option>
                <option value="secundaria">Secundaria</option>
                <option value="preparatoria">Preparatoria / Bachillerato</option>
                <option value="universidad">Universidad</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="password" 
                formControlName="password" 
                placeholder="Crea una contraseña segura"
              >
              <button type="button" class="toggle-password" (click)="togglePassword()">
                <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="password-strength" *ngIf="registerForm.get('password')?.value">
              <div class="strength-bar" [class]="getPasswordStrength()"></div>
              <span>{{ getPasswordStrengthText() }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmar contraseña</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input 
                [type]="showConfirmPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                formControlName="confirmPassword" 
                placeholder="Repite tu contraseña"
              >
              <button type="button" class="toggle-password" (click)="toggleConfirmPassword()">
                <i [class]="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="error-message" *ngIf="registerForm.errors?.['mismatch'] && registerForm.get('confirmPassword')?.touched">
              <i class="fas fa-exclamation-circle"></i>
              <span>Las contraseñas no coinciden</span>
            </div>
          </div>

          <div class="form-options">
            <label class="terms">
              <input type="checkbox" formControlName="acceptTerms">
              <span>Acepto los <a href="#" target="_blank">Términos y Condiciones</a></span>
            </label>
          </div>

          <button type="submit" class="btn-primary" [disabled]="registerForm.invalid || isLoading">
            <span *ngIf="!isLoading">Registrarse</span>
            <span *ngIf="isLoading" class="spinner"></span>
          </button>

          <div class="auth-footer">
            <p>¿Ya tienes una cuenta? <a routerLink="/login">Inicia sesión aquí</a></p>
          </div>
        </form>
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
      max-width: 520px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      animation: fadeInUp 0.5s ease;
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
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
      background-clip: text;
      margin-bottom: 8px;
    }
    .auth-header p {
      color: #7f8c8d;
      margin: 0;
    }
    .auth-form {
      margin-top: 32px;
    }
    .form-group {
      margin-bottom: 20px;
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
    .input-group input, .input-group select {
      width: 100%;
      padding: 14px 16px 14px 48px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 16px;
      transition: all 0.3s ease;
      background: white;
    }
    .input-group input:focus, .input-group select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    .toggle-password {
      position: absolute;
      right: 16px;
      background: none;
      border: none;
      cursor: pointer;
      color: #95a5a6;
    }
    .password-strength {
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .strength-bar {
      height: 4px;
      width: 80px;
      border-radius: 2px;
      background: #e0e0e0;
      position: relative;
      overflow: hidden;
    }
    .strength-bar.weak::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 33%;
      height: 100%;
      background: #e74c3c;
    }
    .strength-bar.medium::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 66%;
      height: 100%;
      background: #f39c12;
    }
    .strength-bar.strong::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: #27ae60;
    }
    .error-message {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      font-size: 12px;
      color: #e74c3c;
    }
    .form-options {
      margin-bottom: 24px;
    }
    .terms {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #7f8c8d;
      font-size: 14px;
    }
    .terms a {
      color: #667eea;
      text-decoration: none;
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
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
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
      font-weight: 500;
    }
    @media (max-width: 768px) {
      .auth-card {
        padding: 32px 24px;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group({
      nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      nivel_educativo: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const password = g.get('password')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getPasswordStrength(): string {
    const pass = this.password?.value || '';
    if (pass.length === 0) return '';
    if (pass.length < 6) return 'weak';
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pass)) return 'strong';
    if (/^(?=.*[a-z])(?=.*\d)/.test(pass)) return 'medium';
    return 'weak';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch(strength) {
      case 'weak': return 'Contraseña débil';
      case 'medium': return 'Contraseña media';
      case 'strong': return 'Contraseña fuerte';
      default: return '';
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    const { nombre_completo, email, nivel_educativo, password } = this.registerForm.value;

    this.authService.register({ nombre_completo, email, password, nivel_educativo }).subscribe({
      next: () => {
        this.toastr.success('¡Cuenta creada exitosamente!', 'Bienvenido a ZENTHOR');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al registrar usuario', 'Error');
        this.isLoading = false;
      }
    });
  }
}
