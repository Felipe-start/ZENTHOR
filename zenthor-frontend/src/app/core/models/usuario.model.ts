export interface Usuario {
  id: string;
  nombre_completo: string;
  email: string;
  nivel_educativo?: 'secundaria' | 'preparatoria' | 'universidad' | 'otro';
  fecha_registro: Date;
  created_at: Date;
  updated_at: Date;
}

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

export interface AuthResponse {
  token: string;
  user: Usuario;
}