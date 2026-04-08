
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
              <input [type]="showPassword ? 'text' : 'password'" id="password" formControlName="password" placeholder="Nueva contraseña">
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmar contraseña</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input [type]="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" formControlName="confirmPassword" placeholder="Repite tu nueva contraseña">
              <button type="button" class="toggle-password" (click)="showConfirmPassword = !showConfirmPassword">
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
    .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; }
    .auth-card { background: white; border-radius: 32px; padding: 48px; width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
    .animate-scale { animation: scaleIn 0.5s ease forwards; }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .logo { width: 80px; height: 80px; border-radius: 20px; object-fit: cover; margin-bottom: 20px; }
    .animate-float { animation: logoFloat 3s ease-in-out infinite; }
    @keyframes logoFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    .auth-header h1 { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
    .form-group { margin-bottom: 20px; }
    .input-group { position: relative; display: flex; align-items: center; }
    .input-group i:first-child { position: absolute; left: 16px; color: #95a5a6; }
    .input-group input { width: 100%; padding: 14px 16px 14px 48px; border: 2px solid #e0e0e0; border-radius: 12px; font-size: 16px; }
    .input-group input:focus { outline: none; border-color: #667eea; }
    .toggle-password { position: absolute; right: 16px; background: none; border: none; cursor: pointer; color: #95a5a6; }
    .error-message { display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 12px; color: #e74c3c; }
    .btn-primary { width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 12px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #eef2f6; }
    .auth-footer a { color: #667eea; text-decoration: none; }
    @media (max-width: 768px) { .auth-card { padding: 32px 24px; } }
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