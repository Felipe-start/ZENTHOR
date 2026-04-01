import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Tarea, TareaWithMateria } from '../models/tarea.model';

@Injectable({
  providedIn: 'root'
})
export class TareasService {
  constructor(private apiService: ApiService) {}

  getTareas(params?: { materia_id?: number; estado?: string }): Observable<TareaWithMateria[]> {
    return this.apiService.get<Tarea[]>('/api/tareas', params).pipe(
      map(tareas => tareas.map(tarea => ({
        ...tarea,
        materia_nombre: 'Cargando...',
        materia_color: '#6c757d'
      })))
    );
  }

  getTareasProximas(): Observable<TareaWithMateria[]> {
    return this.apiService.get<Tarea[]>('/api/tareas/proximas').pipe(
      map(tareas => tareas.map(tarea => ({
        ...tarea,
        materia_nombre: 'Cargando...',
        materia_color: '#6c757d'
      })))
    );
  }

  getTareaById(id: number): Observable<Tarea> {
    return this.apiService.get<Tarea>(`/api/tareas/${id}`);
  }

  createTarea(tarea: Partial<Tarea>): Observable<Tarea> {
    return this.apiService.post<Tarea>('/api/tareas', tarea);
  }

  updateTarea(id: number, tarea: Partial<Tarea>): Observable<Tarea> {
    return this.apiService.put<Tarea>(`/api/tareas/${id}`, tarea);
  }

  deleteTarea(id: number): Observable<any> {
    return this.apiService.delete<any>(`/api/tareas/${id}`);
  }

  completarTarea(id: number): Observable<Tarea> {
    return this.apiService.put<Tarea>(`/api/tareas/${id}/completar`, {});
  }
}