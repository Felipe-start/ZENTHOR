import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
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
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
      return;
    }
    
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail, rememberMe: true });
    }
  }

  // Manejo de error cuando la imagen del logo no carga
  handleImageError(event: any): void {
    // Si no carga la imagen, mostramos un placeholder con el texto "Z"
    event.target.style.display = 'none';
    const container = event.target.parentElement;
    if (container && !container.querySelector('.logo-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'logo-placeholder';
      placeholder.innerHTML = '<span>Z</span>';
      placeholder.style.cssText = `
        width: 100px;
        height: 100px;
        border-radius: 24px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        font-weight: 800;
        color: white;
        margin: 0 auto 20px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
      `;
      container.appendChild(placeholder);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.isLoading = true;
    const { email, password, rememberMe } = this.loginForm.value;
    
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.toastr.success('¡Bienvenido a ZENTHOR!', 'Éxito');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        let errorMessage = 'Credenciales incorrectas';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message === 'Email not confirmed') {
          errorMessage = 'Por favor confirma tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.';
        } else if (error.status === 400) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Correo electrónico o contraseña incorrectos';
        }
        
        this.toastr.error(errorMessage, 'Error de autenticación');
        this.isLoading = false;
      }
    });
  }
}