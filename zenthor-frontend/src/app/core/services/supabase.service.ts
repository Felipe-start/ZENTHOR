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
      environment.supabaseAnonKey
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
    
    if (!data.session?.access_token || !data.user?.id || !data.user?.email) {
      throw new Error('Invalid login response');
    }
    
    return {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        nombre_completo: data.user.user_metadata?.["nombre_completo"] || data.user.email.split('@')[0],
        nivel_educativo: data.user.user_metadata?.["nivel_educativo"]
      }
    };
  }

  async register(email: string, password: string, metadata: any): Promise<AuthResponse> {
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
    
    return {
      token: data.session?.access_token || '',
      user: {
        id: data.user.id,
        email: data.user.email,
        nombre_completo: metadata.nombre_completo,
        nivel_educativo: metadata.nivel_educativo
      }
    };
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  getCurrentUser(): Promise<User | null> {
    return this.supabase.auth.getUser().then(({ data }) => data.user).catch(() => null);
  }
}
