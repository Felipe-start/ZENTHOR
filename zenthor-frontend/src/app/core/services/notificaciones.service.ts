import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ConfigNotificaciones {
  whatsapp_activo: boolean;
  telefono: string;
  email_activo: boolean;
  recordatorio_24h: boolean;
  recordatorio_1h: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private apiUrl = 'https://special-giggle-r4pg4p79qjwq3pj7r-3000.app.github.dev/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  guardarConfiguracion(config: ConfigNotificaciones): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/notificaciones/configurar`,
      config,
      { headers: this.getHeaders() }
    );
  }

  enviarPrueba(tipo?: 'email' | 'whatsapp'): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/notificaciones/test`,
      { tipo },
      { headers: this.getHeaders() }
    );
  }
}