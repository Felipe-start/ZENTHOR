export interface Materia {
  id: number;
  usuario_id: string;
  nombre: string;
  profesor?: string;
  horario?: string;
  color?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MateriaStats {
  id: number;
  nombre: string;
  profesor: string;
  color: string;
  tareas_pendientes: number;
  total_tareas: number;
  proximo_examen?: Date;
}