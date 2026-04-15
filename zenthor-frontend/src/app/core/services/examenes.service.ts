import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Examen, ExamenWithMateria } from '../models/examen.model';

@Injectable({
  providedIn: 'root'
})
export class ExamenesService {
  constructor(private apiService: ApiService) {}

  getExamenes(params?: { materia_id?: number }): Observable<ExamenWithMateria[]> {
    return this.apiService.get<any>('/api/examenes', params).pipe(
      map(response => {
        // El backend devuelve { success: true, data: [], count: 0 }
        const examenes = response.data || response;
        if (!Array.isArray(examenes)) return [];
        return examenes.map((examen: any) => ({
          ...examen,
          materia_nombre: examen.materia_nombre || examen.materias?.nombre || 'Sin materia',
          materia_color: examen.materia_color || examen.materias?.color || '#6366f1'
        }));
      })
    );
  }

  getExamenesProximos(): Observable<ExamenWithMateria[]> {
    return this.apiService.get<any>('/api/examenes/proximos').pipe(
      map(response => {
        const examenes = response.data || response;
        if (!Array.isArray(examenes)) return [];
        return examenes.map((examen: any) => ({
          ...examen,
          materia_nombre: examen.materia_nombre || examen.materias?.nombre || 'Sin materia',
          materia_color: examen.materia_color || examen.materias?.color || '#6366f1'
        }));
      })
    );
  }

  getExamenById(id: number): Observable<Examen> {
    return this.apiService.get<any>(`/api/examenes/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  createExamen(examen: Partial<Examen>): Observable<Examen> {
    return this.apiService.post<any>('/api/examenes', examen).pipe(
      map(response => response.data || response)
    );
  }

  updateExamen(id: number, examen: Partial<Examen>): Observable<Examen> {
    return this.apiService.put<any>(`/api/examenes/${id}`, examen).pipe(
      map(response => response.data || response)
    );
  }

  deleteExamen(id: number): Observable<any> {
    return this.apiService.delete<any>(`/api/examenes/${id}`).pipe(
      map(response => response.data || response)
    );
  }
}
