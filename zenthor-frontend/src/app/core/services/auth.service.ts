import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { SupabaseService, Usuario, AuthResponse } from './supabase.service';
import { RecordatoriosService } from './recordatorios.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre_completo: string;
  nivel_educativo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser: Observable<Usuario | null>;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private recordatoriosService: RecordatoriosService
  ) {
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(
      this.getUserFromStorage()
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private getUserFromStorage(): Usuario | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !!this.currentUserValue;
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return from(this.supabaseService.login(credentials.email, credentials.password)).pipe(
      tap(async (response) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          if (response.refresh_token) {
            localStorage.setItem('refresh_token', response.refresh_token);
          }
          this.currentUserSubject.next(response.user);
          
          // ✅ ACTIVAR RECORDATORIOS con la contraseña
          try {
            await this.recordatoriosService.guardarCredenciales(credentials.password);
            console.log('✅ Recordatorios activados automáticamente');
          } catch (e) {
            console.warn('⚠️ Error activando recordatorios:', e);
          }
        }
      }),
      catchError((error) => {
        console.error('Error en login:', error);
        return throwError(() => new Error(error.message || 'Credenciales incorrectas'));
      })
    );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    const metadata = {
      nombre_completo: data.nombre_completo,
      nivel_educativo: data.nivel_educativo
    };
    
    return from(this.supabaseService.register(data.email, data.password, metadata)).pipe(
      tap(async (response) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          if (response.refresh_token) {
            localStorage.setItem('refresh_token', response.refresh_token);
          }
          this.currentUserSubject.next(response.user);
          
          // ✅ ACTIVAR RECORDATORIOS con la contraseña
          try {
            await this.recordatoriosService.guardarCredenciales(data.password);
            console.log('✅ Recordatorios activados automáticamente');
          } catch (e) {
            console.warn('⚠️ Error activando recordatorios:', e);
          }
        }
      }),
      catchError((error) => {
        console.error('Error en registro:', error);
        return throwError(() => new Error(error.message || 'Error al registrar usuario'));
      })
    );
  }

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    return this.supabaseService.resetPassword(email);
  }

  async updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    const result = await this.supabaseService.updatePassword(newPassword);
    if (result.success) {
      this.logout();
    }
    return result;
  }

  logout(): void {
    this.supabaseService.logout().catch(console.error);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}