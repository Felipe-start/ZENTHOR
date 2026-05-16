import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface MensajeChat {
  rol: 'usuario' | 'asistente';
  contenido: string;
  fuentes?: { titulo: string; fuente: string; similitud?: number }[];
}

export interface DocumentoVector {
  id: string;
  titulo: string;
  fuente: string;
  creado_en: string;
  metadata: any;
}

@Injectable({ providedIn: 'root' })
export class RagService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  enviarPregunta(pregunta: string, conversacion_id?: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/rag/chat`,
      { pregunta, conversacion_id },
      { headers: this.getHeaders() }
    );
  }

  generarGuia(materia_id: number, temas: string[], nivel?: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/rag/generar-guia`,
      { materia_id, temas, nivel },
      { headers: this.getHeaders() }
    );
  }

  subirDocumento(file: File, titulo?: string, fuente?: string): Observable<any> {
    const formData = new FormData();
    formData.append('documento', file);
    if (titulo) formData.append('titulo', titulo);
    if (fuente) formData.append('fuente', fuente);

    return this.http.post(
      `${this.apiUrl}/documentos/upload`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  obtenerDocumentos(): Observable<DocumentoVector[]> {
    return this.http.get<DocumentoVector[]>(
      `${this.apiUrl}/documentos`,
      { headers: this.getHeaders() }
    );
  }

  eliminarDocumento(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/documentos/${id}`,
      { headers: this.getHeaders() }
    );
  }
}