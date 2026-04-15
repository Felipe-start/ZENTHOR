export interface Examen {
  id: number;
  usuario_id: string;
  materia_id: number;
  fecha_examen: string;
  temas?: string;
  aula?: string;
  created_at: string;
  updated_at: string;
}

export interface ExamenWithMateria extends Examen {
  materia_nombre: string;
  materia_color: string;
}
