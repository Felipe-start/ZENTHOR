import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RecordatoriosConfig {
  activos: boolean;
  email: string;
  configurado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RecordatoriosService {
  private apiUrl = 'https://zenthor.onrender.com/api';

  constructor(private http: HttpClient) {}

  /**
   * Activar o desactivar los recordatorios del usuario
   */
  toggleRecordatorios(activo: boolean): Observable<any> {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    return this.http.post(`${this.apiUrl}/recordatorios/configurar`, {
      activo: activo,
      refresh_token: refreshToken
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Obtener el estado actual de los recordatorios del usuario
   */
  getEstado(): Observable<{ success: boolean; data: RecordatoriosConfig }> {
    const token = localStorage.getItem('token');
    
    return this.http.get<{ success: boolean; data: RecordatoriosConfig }>(
      `${this.apiUrl}/recordatorios/estado`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  /**
   * Guardar refresh token después del login
   */
  async guardarRefreshToken(refreshToken: string): Promise<void> {
    const token = localStorage.getItem('token');
    try {
      await this.http.post(`${this.apiUrl}/recordatorios/configurar`, {
        activo: true,
        refresh_token: refreshToken
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).toPromise();
      console.log('✅ Recordatorios activados correctamente');
    } catch (error) {
      console.error('❌ Error guardando refresh token:', error);
    }
  }
}