import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ConfiguracionRecordatorios } from '../models/configuracion.model';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  constructor(private apiService: ApiService) {}

  getConfiguracion(): Observable<ConfiguracionRecordatorios> {
    return this.apiService.get<ConfiguracionRecordatorios>('/api/configuracion/recordatorios');
  }

  updateConfiguracion(config: Partial<ConfiguracionRecordatorios>): Observable<ConfiguracionRecordatorios> {
    return this.apiService.put<ConfiguracionRecordatorios>('/api/configuracion/recordatorios', config);
  }
}