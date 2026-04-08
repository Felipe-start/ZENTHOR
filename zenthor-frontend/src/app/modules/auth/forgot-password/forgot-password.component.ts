import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm: FormGroup;
  isLoading = false;
  
  // Variables para el CAPTCHA
  captchaValue: string = '';
  captchaInput: string = '';
  captchaError: boolean = false;
  captchaRefreshing: boolean = false;
  
  // Variables para el efecto visual
  showSuccessAnimation: boolean = false;
  emailSent: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      captcha: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.generateCaptcha();
  }

  // Generar CAPTCHA aleatorio (número de 4-6 dígitos o fórmula matemática)
  generateCaptcha(): void {
    this.captchaRefreshing = true;
    
    // Opciones de CAPTCHA: puede ser número o fórmula matemática
    const captchaType = Math.random() > 0.5 ? 'number' : 'math';
    
    if (captchaType === 'number') {
      // CAPTCHA numérico de 6 dígitos
      const num = Math.floor(100000 + Math.random() * 900000);
      this.captchaValue = num.toString();
    } else {
      // CAPTCHA matemático
      const num1 = Math.floor(Math.random() * 20) + 1;
      const num2 = Math.floor(Math.random() * 20) + 1;
      const operators = ['+', '×', '-'];
      const operator = operators[Math.floor(Math.random() * operators.length)];
      
      let result: number;
      let displayFormula: string;
      
      switch(operator) {
        case '+':
          result = num1 + num2;
          displayFormula = `${num1} + ${num2}`;
          break;
        case '×':
          result = num1 * num2;
          displayFormula = `${num1} × ${num2}`;
          break;
        case '-':
          result = num1 - num2;
          displayFormula = `${num1} - ${num2}`;
          break;
        default:
          result = num1 + num2;
          displayFormula = `${num1} + ${num2}`;
      }
      
      this.captchaValue = result.toString();
      this.captchaValue = `${displayFormula} = ?`;
      // Guardamos el resultado real para comparar
      (this as any).captchaResult = result;
    }
    
    setTimeout(() => {
      this.captchaRefreshing = false;
    }, 300);
  }

  // Validar CAPTCHA
  validateCaptcha(): boolean {
    const userInput = this.forgotForm.get('captcha')?.value;
    
    if (this.captchaValue.includes('=')) {
      // Es una fórmula matemática
      const expectedResult = (this as any).captchaResult;
      const isValid = parseInt(userInput) === expectedResult;
      if (!isValid) {
        this.captchaError = true;
        setTimeout(() => { this.captchaError = false; }, 2000);
        this.generateCaptcha();
        this.forgotForm.get('captcha')?.setValue('');
        return false;
      }
      return true;
    } else {
      // Es número normal
      const isValid = userInput === this.captchaValue;
      if (!isValid) {
        this.captchaError = true;
        setTimeout(() => { this.captchaError = false; }, 2000);
        this.generateCaptcha();
        this.forgotForm.get('captcha')?.setValue('');
        return false;
      }
      return true;
    }
  }

  // Refrescar CAPTCHA
  refreshCaptcha(): void {
    this.generateCaptcha();
    this.forgotForm.get('captcha')?.setValue('');
    this.captchaError = false;
  }

  async onSubmit(): Promise<void> {
    if (this.forgotForm.invalid) {
      Object.keys(this.forgotForm.controls).forEach(key => {
        this.forgotForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Validar CAPTCHA
    if (!this.validateCaptcha()) {
      this.toastr.error('Código de verificación incorrecto', 'Error');
      return;
    }

    this.isLoading = true;
    const { email } = this.forgotForm.value;
    
    const result = await this.authService.resetPassword(email);
    
    if (result.success) {
      this.showSuccessAnimation = true;
      this.emailSent = true;
      this.toastr.success(result.message, 'Correo enviado');
      
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 3000);
    } else {
      this.toastr.error(result.message, 'Error');
      this.isLoading = false;
    }
  }

  handleImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/80x80?text=Z';
  }
}