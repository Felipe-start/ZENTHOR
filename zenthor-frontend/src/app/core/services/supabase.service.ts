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
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    if (!data.session?.access_token) {
      throw new Error('No se recibió token de acceso');
    }
    
    const token = data.session.access_token;
    
    localStorage.setItem('token', token);
    localStorage.setItem('supabase-auth-token', token);
    
    const user: Usuario = {
      id: data.user!.id,
      email: data.user!.email!,
      nombre_completo: data.user!.user_metadata?.["nombre_completo"] || data.user!.email!.split('@')[0],
      nivel_educativo: data.user!.user_metadata?.["nivel_educativo"]
    };
    localStorage.setItem('user', JSON.stringify(user));
    
    return { token, user };
  }

  async register(email: string, password: string, metadata: any): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
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
    
    const user: Usuario = {
      id: data.user.id,
      email: data.user.email,
      nombre_completo: metadata.nombre_completo,
      nivel_educativo: metadata.nivel_educativo
    };
    
    if (token) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return { token, user };
  }

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Se ha enviado un enlace de recuperación a tu correo electrónico'
    };
  }

  async updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Contraseña actualizada exitosamente'
    };
  }

  async logout() {
    await this.supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('supabase-auth-token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): Promise<User | null> {
    return this.supabase.auth.getUser()
      .then(({ data }) => data.user)
      .catch(() => null);
  }
}
