class ExamenesService {
  constructor(supabaseClient, userId) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  async verificarMateria(materiaId) {
    const { data, error } = await this.supabase
      .from('materias')
      .select('id')
      .eq('id', materiaId)
      .eq('usuario_id', this.userId)
      .single();
    if (error || !data) throw new Error('La materia no existe o no te pertenece');
    return true;
  }

  async getAll() {
    const { data, error } = await this.supabase
      .from('examenes')
      .select(`
        *,
        materias ( nombre, color )
      `)
      .eq('usuario_id', this.userId)
      .order('fecha_examen', { ascending: true });
    if (error) throw new Error(`Error al obtener exámenes: ${error.message}`);
    return data.map(ex => ({
      ...ex,
      materia_nombre: ex.materias?.nombre,
      materia_color: ex.materias?.color || '#6366f1',
      materias: undefined
    }));
  }

  async getProximos() {
    const hoy = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('examenes')
      .select(`
        *,
        materias ( nombre, color )
      `)
      .eq('usuario_id', this.userId)
      .gte('fecha_examen', hoy)
      .order('fecha_examen', { ascending: true });
    if (error) throw new Error(`Error al obtener exámenes próximos: ${error.message}`);
    return data.map(ex => ({
      ...ex,
      materia_nombre: ex.materias?.nombre,
      materia_color: ex.materias?.color || '#6366f1',
      materias: undefined
    }));
  }

  async getById(id) {
    const { data, error } = await this.supabase
      .from('examenes')
      .select(`
        *,
        materias ( nombre, color )
      `)
      .eq('id', id)
      .eq('usuario_id', this.userId)
      .single();
    if (error) throw new Error('Examen no encontrado');
    return {
      ...data,
      materia_nombre: data.materias?.nombre,
      materia_color: data.materias?.color || '#6366f1',
      materias: undefined
    };
  }

  async create(examenData) {
    await this.verificarMateria(examenData.materia_id);
    const { data, error } = await this.supabase
      .from('examenes')
      .insert({
        usuario_id: this.userId,
        materia_id: examenData.materia_id,
        fecha_examen: examenData.fecha_examen,
        temas: examenData.temas || null,
        aula: examenData.aula || null
      })
      .select()
      .single();
    if (error) throw new Error(`Error al crear examen: ${error.message}`);
    return data;
  }

  async update(id, updateData) {
    await this.getById(id);
    if (updateData.materia_id) await this.verificarMateria(updateData.materia_id);
    const { data, error } = await this.supabase
      .from('examenes')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('usuario_id', this.userId)
      .select()
      .single();
    if (error) throw new Error(`Error al actualizar examen: ${error.message}`);
    return data;
  }

  async delete(id) {
    await this.getById(id);
    const { error } = await this.supabase
      .from('examenes')
      .delete()
      .eq('id', id)
      .eq('usuario_id', this.userId);
    if (error) throw new Error(`Error al eliminar examen: ${error.message}`);
    return { message: 'Examen eliminado correctamente' };
  }
}

module.exports = ExamenesService;