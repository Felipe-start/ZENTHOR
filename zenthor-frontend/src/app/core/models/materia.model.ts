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
  // Propiedades extendidas (no vienen de la BD directamente)
  tareas_pendientes?: number;
  total_tareas?: number;
  proximo_examen?: Date;
}

export interface MateriaStats {
  materia_id: number;
  tareas_pendientes: number;
  examenes_proximos: number;
}