import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TareaWithMateria } from '../../../core/models/tarea.model';

@Component({
  selector: 'app-tarea-card',
  template: `
    <div class="tarea-card" [class.completada]="tarea.estado === 'completada'">
      <div class="tarea-header">
        <div class="tarea-titulo">
          <div class="priority-indicator" [class]="tarea.prioridad"></div>
          <h4 [class.tachado]="tarea.estado === 'completada'">{{ tarea.titulo }}</h4>
          <span class="prioridad-badge" [class]="tarea.prioridad">
            <i class="fas" [class.fa-flag]="tarea.prioridad === 'alta'" 
                          [class.fa-flag-checkered]="tarea.prioridad === 'media'"
                          [class.fa-flag]="tarea.prioridad === 'baja'"></i>
            {{ prioridadTexto }}
          </span>
        </div>
        <div class="tarea-actions">
          <button class="btn-icon edit" (click)="onEditar()" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete" (click)="onEliminar()" title="Eliminar">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      
      <div class="tarea-materia" [style.backgroundColor]="tarea.materia_color + '15'" [style.color]="tarea.materia_color">
        <i class="fas fa-book"></i>
        <span>{{ tarea.materia_nombre }}</span>
      </div>
      
      <div class="tarea-descripcion" *ngIf="tarea.descripcion">
        <i class="fas fa-align-left"></i>
        <p>{{ tarea.descripcion | slice:0:100 }}{{ tarea.descripcion.length > 100 ? '...' : '' }}</p>
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
          Completar
        </button>
        
        <div *ngIf="tarea.estado === 'completada'" class="completada-badge">
          <i class="fas fa-check-circle"></i>
          <span>Completada</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tarea-card {
      background: white;
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid #f0f0f0;
      position: relative;
      overflow: hidden;
    }
    
    .tarea-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .tarea-card:hover::before {
      opacity: 1;
    }
    
    .tarea-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    }
    
    .tarea-card.completada {
      opacity: 0.75;
      background: linear-gradient(135deg, #f9fafb, #f3f4f6);
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
      flex: 1;
    }
    
    .priority-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .priority-indicator.alta {
      background: #ef4444;
      box-shadow: 0 0 8px #ef4444;
    }
    
    .priority-indicator.media {
      background: #f59e0b;
      box-shadow: 0 0 8px #f59e0b;
    }
    
    .priority-indicator.baja {
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    
    .tarea-titulo h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .tachado {
      text-decoration: line-through;
      color: #9ca3af;
    }
    
    .prioridad-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 600;
    }
    
    .prioridad-badge.alta {
      background: #fee2e2;
      color: #dc2626;
    }
    
    .prioridad-badge.media {
      background: #fef3c7;
      color: #d97706;
    }
    
    .prioridad-badge.baja {
      background: #dcfce7;
      color: #10b981;
    }
    
    .tarea-actions {
      display: flex;
      gap: 8px;
    }
    
    .btn-icon {
      width: 32px;
      height: 32px;
      background: none;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #9ca3af;
    }
    
    .btn-icon.edit:hover {
      background: #e0e7ff;
      color: #6366f1;
      transform: scale(1.05);
    }
    
    .btn-icon.delete:hover {
      background: #fee2e2;
      color: #ef4444;
      transform: scale(1.05);
    }
    
    .tarea-materia {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      margin-bottom: 12px;
    }
    
    .tarea-descripcion {
      margin: 12px 0;
      padding: 12px;
      background: #f9fafb;
      border-radius: 14px;
      display: flex;
      gap: 10px;
    }
    
    .tarea-descripcion i {
      color: #9ca3af;
      margin-top: 2px;
    }
    
    .tarea-descripcion p {
      margin: 0;
      font-size: 0.85rem;
      color: #4b5563;
      line-height: 1.5;
    }
    
    .tarea-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
    }
    
    .fecha-entrega {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: #6b7280;
    }
    
    .fecha-entrega.vencida {
      color: #ef4444;
      font-weight: 600;
    }
    
    .btn-completar {
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      padding: 8px 18px;
      border-radius: 30px;
      color: white;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn-completar:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
    
    .completada-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #10b981;
      font-weight: 500;
      font-size: 0.8rem;
      background: #dcfce7;
      padding: 6px 14px;
      border-radius: 30px;
    }
    
    @media (max-width: 480px) {
      .tarea-card {
        padding: 16px;
      }
      
      .tarea-footer {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }
      
      .tarea-actions {
        flex-direction: column;
      }
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