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

  // ✅ NUEVO: Guardar credenciales (email y password)
  guardarCredenciales(password: string): Promise<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrl}/recordatorios/guardar-credenciales`, {
      password: password
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).toPromise();
  }

  // Activar/desactivar recordatorios
  toggleRecordatorios(activo: boolean): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrl}/recordatorios/configurar`, {
      activo: activo
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Obtener estado
  getEstado(): Observable<{ success: boolean; data: RecordatoriosConfig }> {
    const token = localStorage.getItem('token');
    return this.http.get<{ success: boolean; data: RecordatoriosConfig }>(
      `${this.apiUrl}/recordatorios/estado`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
}