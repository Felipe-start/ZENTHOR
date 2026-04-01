import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Materia, MateriaStats } from '../models/materia.model';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {
  constructor(private apiService: ApiService) {}

  getMaterias(): Observable<Materia[]> {
    return this.apiService.get<Materia[]>('/api/materias');
  }

  getMateriasActivas(): Observable<Materia[]> {
    return this.apiService.get<Materia[]>('/api/materias', { activo: true });
  }

  getMateriaById(id: number): Observable<Materia> {
    return this.apiService.get<Materia>(`/api/materias/${id}`);
  }

  getMateriaStats(id: number): Observable<MateriaStats> {
    return this.apiService.get<MateriaStats>(`/api/materias/${id}/stats`);
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