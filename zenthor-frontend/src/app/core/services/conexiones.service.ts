import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface ConexionEstado {
  google_classroom: { activo: boolean; ultima_sincronizacion?: string; nombre?: string };
  notion: { activo: boolean; ultima_sincronizacion?: string; nombre?: string };
  teams: { activo: boolean; ultima_sincronizacion?: string; nombre?: string };
  moodle: { activo: boolean; ultima_sincronizacion?: string; nombre?: string };
}

@Injectable({ providedIn: 'root' })
export class ConexionesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  obtenerConexiones(): Observable<{ success: boolean; data: ConexionEstado }> {
    return this.http.get<{ success: boolean; data: ConexionEstado }>(
      `${this.apiUrl}/conexiones`,
      { headers: this.getHeaders() }
    );
  }

  conectarGoogle(): Observable<{ success: boolean; url: string }> {
    return this.http.get<{ success: boolean; url: string }>(
      `${this.apiUrl}/conexiones/google/iniciar`,
      { headers: this.getHeaders() }
    );
  }

  configurarMoodle(moodle_url: string, moodle_token: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/conexiones/moodle`,
      { moodle_url, moodle_token },
      { headers: this.getHeaders() }
    );
  }

  sincronizarGoogle(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/conexiones/google/sync`,
      {},
      { headers: this.getHeaders() }
    );
  }

  desconectar(tipo: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/conexiones/${tipo}`,
      { headers: this.getHeaders() }
    );
  }
}