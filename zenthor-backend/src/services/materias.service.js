class MateriasService {
  constructor(supabaseClient, userId) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  /**
   * Obtener todas las materias activas del usuario
   */
  async getAll() {
    const { data, error } = await this.supabase
      .from('materias')
      .select('*')
      .eq('usuario_id', this.userId)
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener materias: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtener una materia por ID (verificando propiedad)
   */
  async getById(id) {
    const { data, error } = await this.supabase
      .from('materias')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', this.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Materia no encontrada');
      }
      throw new Error(`Error al obtener materia: ${error.message}`);
    }

    return data;
  }

  /**
   * Crear una nueva materia
   */
  async create(materiaData) {
    const { nombre, profesor, horario, color } = materiaData;

    const { data, error } = await this.supabase
      .from('materias')
      .insert({
        usuario_id: this.userId,
        nombre,
        profesor: profesor || null,
        horario: horario || null,
        color: color || null,
        activo: true
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear materia: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualizar una materia existente
   */
  async update(id, updateData) {
    // Primero verificamos que la materia existe y pertenece al usuario
    await this.getById(id);

    const { data, error } = await this.supabase
      .from('materias')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('usuario_id', this.userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar materia: ${error.message}`);
    }

    return data;
  }

  /**
   * Eliminación lógica de materia (activo = false)
   */
  async delete(id) {
    // Primero verificamos que la materia existe y pertenece al usuario
    await this.getById(id);

    const { data, error } = await this.supabase
      .from('materias')
      .update({
        activo: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('usuario_id', this.userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al eliminar materia: ${error.message}`);
    }

    return { message: 'Materia eliminada correctamente', materia: data };
  }

  /**
   * Restaurar una materia eliminada lógicamente
   */
  async restore(id) {
    const { data, error } = await this.supabase
      .from('materias')
      .update({
        activo: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('usuario_id', this.userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al restaurar materia: ${error.message}`);
    }

    return { message: 'Materia restaurada correctamente', materia: data };
  }

  /**
   * Obtener estadísticas de la materia (tareas pendientes, exámenes próximos)
   */
  async getStats(id) {
    // Verificar propiedad
    await this.getById(id);

    // Obtener tareas pendientes
    const { data: tareas, error: tareasError } = await this.supabase
      .from('tareas')
      .select('id, estado, fecha_entrega')
      .eq('materia_id', id)
      .eq('estado', 'pendiente');

    if (tareasError) {
      throw new Error(`Error al obtener estadísticas: ${tareasError.message}`);
    }

    // Obtener exámenes próximos
    const { data: examenes, error: examenesError } = await this.supabase
      .from('examenes')
      .select('id, fecha_examen')
      .eq('materia_id', id)
      .gte('fecha_examen', new Date().toISOString());

    if (examenesError) {
      throw new Error(`Error al obtener estadísticas: ${examenesError.message}`);
    }

    return {
      materia_id: id,
      tareas_pendientes: tareas.length,
      examenes_proximos: examenes.length
    };
  }
}

module.exports = MateriasService;
