import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Materia, MateriaStats } from '../models/materia.model';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {
  constructor(private apiService: ApiService) {}

  getMaterias(): Observable<Materia[]> {
    return this.apiService.get<any>('/api/materias').pipe(
      map(response => {
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        console.warn('Respuesta inesperada de materias:', response);
        return [];
      })
    );
  }

  getMateriasActivas(): Observable<Materia[]> {
    return this.apiService.get<any>('/api/materias', { activo: true }).pipe(
      map(response => {
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        console.warn('Respuesta inesperada de materias activas:', response);
        return [];
      })
    );
  }

  getMateriaById(id: number): Observable<Materia> {
    return this.apiService.get<any>(`/api/materias/${id}`).pipe(
      map(response => {
        if (response && response.data) {
          return response.data;
        }
        return response;
      })
    );
  }

  getMateriaStats(id: number): Observable<MateriaStats> {
    return this.apiService.get<any>(`/api/materias/${id}/stats`).pipe(
      map(response => {
        if (response && response.data) {
          return response.data;
        }
        return response;
      })
    );
  }

  createMateria(materia: Partial<Materia>): Observable<Materia> {
    return this.apiService.post<Materia>('/api/materias', materia);
  }

  updateMateria(id: number, materia: Partial<Materia>): Observable<Materia> {
    return this.apiService.put<Materia>(`/api/materias/${id}`, materia);
  }

  deleteMateria(id: number): Observable<any> {
    return this.apiService.delete<any>(`/api/materias/${id}`);
  }

  restoreMateria(id: number): Observable<Materia> {
    return this.apiService.post<Materia>(`/api/materias/${id}/restore`, {});
  }
}