export interface Tarea {
  id: number;
  usuario_id: string;
  materia_id: number;
  titulo: string;
  descripcion?: string;
  fecha_entrega: Date;
  estado: 'pendiente' | 'completada';
  prioridad: 'baja' | 'media' | 'alta';
  fecha_completado?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TareaWithMateria extends Tarea {
  materia_nombre: string;
  materia_color: string;
}