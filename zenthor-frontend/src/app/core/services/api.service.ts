import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'Ocurrió un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.';
      this.toastr.error(errorMessage, 'Error de conexión');
    } else if (error.status === 401) {
      errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente';
      this.toastr.error(errorMessage, 'No autorizado');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
      this.toastr.error(errorMessage, 'Error');
    } else {
      this.toastr.error(errorMessage, 'Error');
    }
    
    return throwError(() => new Error(errorMessage));
  }

  get<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    console.log('GET Request:', url);
    return this.http.get<T>(url, { headers: this.getHeaders(), params }).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    console.log('POST Request:', url);
    return this.http.post<T>(url, data, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    console.log('PUT Request:', url);
    return this.http.put<T>(url, data, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    console.log('DELETE Request:', url);
    return this.http.delete<T>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}
