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

getTareas(params?: { materia_id?: number; estado?: string; prioridad?: string }): Observable<TareaWithMateria[]> {
  return this.apiService.get<any>('/api/tareas', params).pipe(
    map(response => {
      // Si la respuesta tiene una propiedad 'data' que es un array
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      // Si la respuesta es directamente un array
      if (Array.isArray(response)) {
        return response;
      }
      // Si no, retornar array vacío
      console.warn('Respuesta inesperada de tareas:', response);
      return [];
    })
  );
}

getTareasProximas(): Observable<TareaWithMateria[]> {
  return this.apiService.get<any>('/api/tareas/proximas').pipe(
    map(response => {
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    })
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