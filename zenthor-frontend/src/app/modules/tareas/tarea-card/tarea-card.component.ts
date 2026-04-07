import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TareaWithMateria } from '../../../core/models/tarea.model';

@Component({
  selector: 'app-tarea-card',
  template: `
    <div class="tarea-card" [class.completada]="tarea.estado === 'completada'">
      <div class="tarea-header">
        <div class="tarea-titulo">
          <h4 [class.tachado]="tarea.estado === 'completada'">{{ tarea.titulo }}</h4>
          <span class="prioridad" [class]="tarea.prioridad">
            {{ prioridadTexto }}
          </span>
        </div>
        <div class="tarea-actions">
          <button class="btn-icon" (click)="onEditar()" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon" (click)="onEliminar()" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="tarea-materia" [style.backgroundColor]="tarea.materia_color + '20'" [style.color]="tarea.materia_color">
        <i class="fas fa-book"></i>
        <span>{{ tarea.materia_nombre }}</span>
      </div>
      
      <div class="tarea-descripcion" *ngIf="tarea.descripcion">
        <p>{{ tarea.descripcion }}</p>
      </div>
      
      <div class="tarea-footer">
        <div class="fecha-entrega" [class.vencida]="isVencida && tarea.estado !== 'completada'">
          <i class="fas fa-calendar-alt"></i>
          <span>{{ fechaFormateada }}</span>
        </div>
        
        <button 
          *ngIf="tarea.estado === 'pendiente'" 
          class="btn-completar"
          (click)="onCompletar()"
        >
          <i class="fas fa-check-circle"></i>
          Marcar completada
        </button>
        
        <span *ngIf="tarea.estado === 'completada'" class="completada-badge">
          <i class="fas fa-check"></i>
          Completada
        </span>
      </div>
    </div>
  `,
  styles: [`
    .tarea-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
    }
    .tarea-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }
    .tarea-card.completada {
      opacity: 0.7;
      background: #f8f9fa;
    }
    .tarea-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .tarea-titulo {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .tarea-titulo h4 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
    .tachado {
      text-decoration: line-through;
      color: #95a5a6;
    }
    .prioridad {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .prioridad.alta {
      background: #fee2e2;
      color: #dc2626;
    }
    .prioridad.media {
      background: #fef3c7;
      color: #d97706;
    }
    .prioridad.baja {
      background: #dcfce7;
      color: #10b981;
    }
    .tarea-actions {
      display: flex;
      gap: 8px;
    }
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      color: #95a5a6;
      transition: color 0.2s;
    }
    .btn-icon:hover {
      color: #667eea;
    }
    .tarea-materia {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      margin-bottom: 12px;
    }
    .tarea-descripcion {
      margin: 12px 0;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 12px;
    }
    .tarea-descripcion p {
      margin: 0;
      font-size: 0.9rem;
      color: #4a5568;
    }
    .tarea-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #eef2f6;
    }
    .fecha-entrega {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #718096;
    }
    .fecha-entrega.vencida {
      color: #dc2626;
      font-weight: 600;
    }
    .btn-completar {
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      color: white;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .btn-completar:hover {
      transform: scale(1.02);
    }
    .completada-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #10b981;
      font-weight: 500;
      font-size: 0.85rem;
    }
  `]
})
export class TareaCardComponent {
  @Input() tarea!: TareaWithMateria;
  @Output() edit = new EventEmitter<TareaWithMateria>();
  @Output() delete = new EventEmitter<number>();
  @Output() complete = new EventEmitter<number>();

  get prioridadTexto(): string {
    const prioridades = {
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta'
    };
    return prioridades[this.tarea.prioridad];
  }

  get fechaFormateada(): string {
    return new Date(this.tarea.fecha_entrega).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get isVencida(): boolean {
    return new Date(this.tarea.fecha_entrega) < new Date();
  }

  onEditar() {
    this.edit.emit(this.tarea);
  }

  onEliminar() {
    this.delete.emit(this.tarea.id);
  }

  onCompletar() {
    this.complete.emit(this.tarea.id);
  }
}