import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecordatoriosService {
  private apiUrl = 'https://zenthor.onrender.com/api';

  constructor(private http: HttpClient) {}

  // 🔥 NUEVO: Actualizar refresh token automáticamente
  actualizarRefreshToken(refreshToken: string): Promise<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrl}/recordatorios/actualizar-refresh-token`, {
      refresh_token: refreshToken
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).toPromise();
  }

  // Guardar refresh token (versión mejorada)
 async guardarRefreshToken(refreshToken: string): Promise<void> {
    const token = localStorage.getItem('token');
    try {
        await this.http.post(`${this.apiUrl}/recordatorios/actualizar-refresh-token`, {
            refresh_token: refreshToken
        }, {
            headers: { Authorization: `Bearer ${token}` }
        }).toPromise();
        console.log('✅ Refresh token guardado en backend');
    } catch (error) {
        console.error('❌ Error guardando refresh token:', error);
    }
}

  // Activar/desactivar recordatorios
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

  // Obtener estado
  getEstado(): Observable<{ success: boolean; data: { activos: boolean; email: string; configurado: boolean } }> {
    const token = localStorage.getItem('token');
    return this.http.get<{ success: boolean; data: { activos: boolean; email: string; configurado: boolean } }>(
      `${this.apiUrl}/recordatorios/estado`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
}