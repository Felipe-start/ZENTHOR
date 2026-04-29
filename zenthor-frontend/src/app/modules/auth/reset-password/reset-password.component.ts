import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  template: `
    <div class="auth-container">
      <div class="auth-card animate-scale">
        <div class="auth-header">
          <img src="assets/images/logo.jpg" alt="ZENTHOR Logo" class="logo animate-float">
          <h1>Nueva Contraseña</h1>
          <p>Ingresa tu nueva contraseña</p>
        </div>
        
        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="password">Nueva contraseña</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input [type]="showPassword ? 'text' : 'password'" 
                     id="password" 
                     formControlName="password" 
                     placeholder="Nueva contraseña"
                     [class.is-invalid]="resetForm.get('password')?.invalid && resetForm.get('password')?.touched">
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword" aria-label="Mostrar contraseña">
                <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback" *ngIf="resetForm.get('password')?.invalid && resetForm.get('password')?.touched">
              <i class="fas fa-exclamation-circle"></i>
              <span>La contraseña debe tener al menos 6 caracteres</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmar contraseña</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input [type]="showConfirmPassword ? 'text' : 'password'" 
                     id="confirmPassword" 
                     formControlName="confirmPassword" 
                     placeholder="Repite tu nueva contraseña"
                     [class.is-invalid]="resetForm.hasError('mismatch') && resetForm.get('confirmPassword')?.touched">
              <button type="button" class="toggle-password" (click)="showConfirmPassword = !showConfirmPassword" aria-label="Mostrar contraseña">
                <i [class]="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="error-message" *ngIf="resetForm.hasError('mismatch') && resetForm.get('confirmPassword')?.touched">
            <i class="fas fa-exclamation-circle"></i>
            <span>Las contraseñas no coinciden</span>
          </div>

          <button type="submit" class="btn-primary" [disabled]="resetForm.invalid || isLoading">
            <span *ngIf="!isLoading">Actualizar contraseña</span>
            <span *ngIf="isLoading" class="spinner"></span>
          </button>

          <div class="auth-footer">
            <p><a routerLink="/login">← Volver al inicio de sesión</a></p>
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
      padding: 1rem;
    }

    .auth-card {
      background: white;
      border-radius: 32px;
      padding: clamp(1.5rem, 5vw, 3rem);
      width: 100%;
      max-width: min(480px, 95%);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .animate-scale {
      animation: scaleIn 0.5s ease forwards;
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .auth-header {
      text-align: center;
      margin-bottom: clamp(1.5rem, 4vw, 2rem);
    }

    .logo {
      width: min(80px, 25vw);
      height: auto;
      aspect-ratio: 1/1;
      border-radius: 20px;
      object-fit: cover;
      margin-bottom: 1.25rem;
    }

    .animate-float {
      animation: logoFloat 3s ease-in-out infinite;
    }

    @keyframes logoFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    .auth-header h1 {
      font-size: clamp(1.25rem, 5vw, 1.75rem);
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }

    .auth-header p {
      color: #7f8c8d;
      font-size: clamp(0.75rem, 3vw, 0.875rem);
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .input-group {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-group i:first-child {
      position: absolute;
      left: 1rem;
      color: #95a5a6;
      font-size: clamp(0.875rem, 3vw, 1rem);
    }

    .input-group input {
      width: 100%;
      padding: clamp(0.75rem, 3vw, 0.875rem) 1rem clamp(0.75rem, 3vw, 0.875rem) 3rem;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: clamp(0.875rem, 3vw, 1rem);
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .input-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .input-group input.is-invalid {
      border-color: #e74c3c;
    }

    .toggle-password {
      position: absolute;
      right: 1rem;
      background: none;
      border: none;
      cursor: pointer;
      color: #95a5a6;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      min-height: 32px;
    }

    .toggle-password:hover {
      color: #667eea;
    }

    .invalid-feedback {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-top: 0.375rem;
      font-size: 0.75rem;
      color: #e74c3c;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-top: 0.375rem;
      margin-bottom: 1rem;
      font-size: 0.75rem;
      color: #e74c3c;
    }

    .btn-primary {
      width: 100%;
      padding: clamp(0.75rem, 3vw, 0.875rem);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: clamp(0.875rem, 3vw, 1rem);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
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
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eef2f6;
    }

    .auth-footer a {
      color: #667eea;
      text-decoration: none;
      font-size: clamp(0.75rem, 3vw, 0.875rem);
    }

    .auth-footer a:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    /* Responsive adicional */
    @media (max-width: 480px) {
      .auth-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    const token = this.route.snapshot.queryParams['access_token'];
    if (!token) {
      this.toastr.error('Enlace inválido o expirado', 'Error');
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const password = g.get('password')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  async onSubmit() {
    if (this.resetForm.invalid) return;

    this.isLoading = true;
    const { password } = this.resetForm.value;
    
    const result = await this.authService.updatePassword(password);
    
    if (result.success) {
      this.toastr.success(result.message, 'Éxito');
      this.router.navigate(['/login']);
    } else {
      this.toastr.error(result.message, 'Error');
    }
    
    this.isLoading = false;
  }
}