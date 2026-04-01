export interface Examen {
  id: number;
  usuario_id: string;
  materia_id: number;
  fecha_examen: Date;
  temas?: string;
  aula?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ExamenWithMateria extends Examen {
  materia_nombre: string;
  materia_color: string;
}