class TareasService {
  constructor(supabaseClient, userId) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  /**
   * Obtener todas las tareas del usuario con filtros opcionales
   */
  async getAll(filters = {}) {
    let query = this.supabase
      .from('tareas')
      .select(`
        *,
        materias (
          nombre,
          color
        )
      `)
      .eq('usuario_id', this.userId);

    // Aplicar filtros
    if (filters.materia_id) {
      query = query.eq('materia_id', filters.materia_id);
    }
    if (filters.estado) {
      query = query.eq('estado', filters.estado);
    }
    if (filters.prioridad) {
      query = query.eq('prioridad', filters.prioridad);
    }

    // Ordenar por fecha de entrega (más cercana primero)
    const { data, error } = await query.order('fecha_entrega', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener tareas: ${error.message}`);
    }

    // Transformar para incluir datos de la materia
    return data.map(tarea => ({
      ...tarea,
      materia_nombre: tarea.materias?.nombre || 'Sin materia',
      materia_color: tarea.materias?.color || '#6c757d',
      materias: undefined
    }));
  }

  /**
   * Obtener tareas de los próximos 7 días
   */
  async getProximas() {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const { data, error } = await this.supabase
      .from('tareas')
      .select(`
        *,
        materias (
          nombre,
          color
        )
      `)
      .eq('usuario_id', this.userId)
      .eq('estado', 'pendiente')
      .gte('fecha_entrega', today.toISOString())
      .lte('fecha_entrega', nextWeek.toISOString())
      .order('fecha_entrega', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener tareas próximas: ${error.message}`);
    }

    return data.map(tarea => ({
      ...tarea,
      materia_nombre: tarea.materias?.nombre || 'Sin materia',
      materia_color: tarea.materias?.color || '#6c757d',
      materias: undefined
    }));
  }

  /**
   * Obtener una tarea por ID (verificando propiedad)
   */
  async getById(id) {
    const { data, error } = await this.supabase
      .from('tareas')
      .select(`
        *,
        materias (
          nombre,
          color
        )
      `)
      .eq('id', id)
      .eq('usuario_id', this.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Tarea no encontrada');
      }
      throw new Error(`Error al obtener tarea: ${error.message}`);
    }

    return {
      ...data,
      materia_nombre: data.materias?.nombre || 'Sin materia',
      materia_color: data.materias?.color || '#6c757d',
      materias: undefined
    };
  }

  /**
   * Validar que la materia existe y pertenece al usuario
   */
  async verificarMateria(materiaId) {
    const { data, error } = await this.supabase
      .from('materias')
      .select('id')
      .eq('id', materiaId)
      .eq('usuario_id', this.userId)
      .single();

    if (error || !data) {
      throw new Error('La materia no existe o no te pertenece');
    }
    return true;
  }

  /**
   * Crear una nueva tarea
   */
  async create(tareaData) {
    // Validar materia
    await this.verificarMateria(tareaData.materia_id);

    const { data, error } = await this.supabase
      .from('tareas')
      .insert({
        usuario_id: this.userId,
        materia_id: tareaData.materia_id,
        titulo: tareaData.titulo,
        descripcion: tareaData.descripcion || null,
        fecha_entrega: tareaData.fecha_entrega,
        prioridad: tareaData.prioridad || 'media',
        estado: 'pendiente'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear tarea: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualizar una tarea existente
   */
  async update(id, updateData) {
    // Verificar que la tarea existe y pertenece al usuario
    await this.getById(id);

    // Si se actualiza la materia, validar
    if (updateData.materia_id) {
      await this.verificarMateria(updateData.materia_id);
    }

    const { data, error } = await this.supabase
      .from('tareas')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('usuario_id', this.userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar tarea: ${error.message}`);
    }

    return data;
  }

  /**
   * Marcar tarea como completada
   */
  async completar(id) {
    // Verificar que la tarea existe y pertenece al usuario
    await this.getById(id);

    const { data, error } = await this.supabase
      .from('tareas')
      .update({
        estado: 'completada',
        fecha_completado: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('usuario_id', this.userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al completar tarea: ${error.message}`);
    }

    return data;
  }

  /**
   * Eliminar tarea (físicamente)
   */
  async delete(id) {
    // Verificar que la tarea existe y pertenece al usuario
    await this.getById(id);

    const { error } = await this.supabase
      .from('tareas')
      .delete()
      .eq('id', id)
      .eq('usuario_id', this.userId);

    if (error) {
      throw new Error(`Error al eliminar tarea: ${error.message}`);
    }

    return { message: 'Tarea eliminada correctamente' };
  }
}

module.exports = TareasService;