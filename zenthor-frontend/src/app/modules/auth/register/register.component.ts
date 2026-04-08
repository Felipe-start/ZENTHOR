import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
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

  passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const password = g.get('password')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  getPasswordStrength(): string {
    const pass = this.registerForm.get('password')?.value || '';
    if (pass.length === 0) return '';
    if (pass.length < 6) return 'weak';
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(pass)) return 'strong';
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pass)) return 'medium';
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

  handleImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/80x80?text=Z';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      if (this.registerForm.hasError('mismatch')) {
        this.toastr.warning('Las contraseñas no coinciden');
      } else if (!this.registerForm.get('acceptTerms')?.value) {
        this.toastr.warning('Debes aceptar los términos y condiciones');
      } else {
        this.toastr.warning('Por favor completa todos los campos correctamente');
      }
      return;
    }

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