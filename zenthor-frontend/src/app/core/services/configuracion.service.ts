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
    return this.apiService.get<ExamenWithMateria[]>('/api/examenes', params).pipe(
      map(examenes => examenes.map(examen => ({
        ...examen,
        materia_nombre: examen.materia_nombre || 'Sin materia',
        materia_color: examen.materia_color || '#6366f1'
      })))
    );
  }

  getExamenesProximos(): Observable<ExamenWithMateria[]> {
    return this.apiService.get<ExamenWithMateria[]>('/api/examenes/proximos').pipe(
      map(examenes => examenes.map(examen => ({
        ...examen,
        materia_nombre: examen.materia_nombre || 'Sin materia',
        materia_color: examen.materia_color || '#6366f1'
      })))
    );
  }

  getExamenById(id: number): Observable<Examen> {
    return this.apiService.get<Examen>(`/api/examenes/${id}`);
  }

  createExamen(examen: Partial<Examen>): Observable<Examen> {
    return this.apiService.post<Examen>('/api/examenes', examen);
  }

  updateExamen(id: number, examen: Partial<Examen>): Observable<Examen> {
    return this.apiService.put<Examen>(`/api/examenes/${id}`, examen);
  }

  deleteExamen(id: number): Observable<any> {
    return this.apiService.delete<any>(`/api/examenes/${id}`);
  }
}