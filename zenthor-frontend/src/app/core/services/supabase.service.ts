import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id: string;
  nombre_completo: string;
  email: string;
  nivel_educativo?: string;
  fecha_registro?: Date;
}

export interface AuthResponse {
  token: string;
  user: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storage: localStorage,
          storageKey: 'supabase-auth-token',
          flowType: 'pkce'
        }
      }
    );
  }

  getClient() {
    return this.supabase;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (!data.session?.access_token || !data.user?.id || !data.user?.email) {
        throw new Error('Invalid login response');
      }
      
      localStorage.setItem('token', data.session.access_token);
      localStorage.setItem('supabase-auth-token', data.session.access_token);
      
      return {
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          nombre_completo: data.user.user_metadata?.["nombre_completo"] || data.user.email.split('@')[0],
          nivel_educativo: data.user.user_metadata?.["nivel_educativo"]
        }
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async register(email: string, password: string, metadata: any): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      
      if (!data.user?.id || !data.user?.email) {
        throw new Error('Invalid registration response');
      }
      
      const token = data.session?.access_token || '';
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('supabase-auth-token', token);
      }
      
      return {
        token: token,
        user: {
          id: data.user.id,
          email: data.user.email,
          nombre_completo: metadata.nombre_completo,
          nivel_educativo: metadata.nivel_educativo
        }
      };
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  // 🔐 NUEVO: Recuperación de contraseña
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'Se ha enviado un enlace de recuperación a tu correo electrónico'
      };
    } catch (error: any) {
      console.error('Error en reset password:', error);
      return {
        success: false,
        message: error.message || 'Error al enviar el correo de recuperación'
      };
    }
  }

  // 🔐 NUEVO: Actualizar contraseña (después del reset)
  async updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'Contraseña actualizada exitosamente'
      };
    } catch (error: any) {
      console.error('Error en update password:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar la contraseña'
      };
    }
  }

  async logout() {
    try {
      await this.supabase.auth.signOut();
      localStorage.removeItem('token');
      localStorage.removeItem('supabase-auth-token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  getCurrentUser(): Promise<User | null> {
    return this.supabase.auth.getUser()
      .then(({ data }) => data.user)
      .catch(() => null);
  }
}