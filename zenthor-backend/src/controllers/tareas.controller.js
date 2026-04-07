const TareasService = require('../services/tareas.service');

const tareasController = {
  /**
   * GET /api/tareas
   * Obtener todas las tareas del usuario con filtros
   */
  async getAllTareas(req, res, next) {
    try {
      const { materia_id, estado, prioridad } = req.query;
      const tareasService = new TareasService(req.supabase, req.userId);
      
      const filters = {};
      if (materia_id) filters.materia_id = parseInt(materia_id);
      if (estado) filters.estado = estado;
      if (prioridad) filters.prioridad = prioridad;
      
      const tareas = await tareasService.getAll(filters);
      
      res.json({
        success: true,
        data: tareas,
        count: tareas.length
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/tareas/proximas
   * Obtener tareas de los próximos 7 días
   */
  async getTareasProximas(req, res, next) {
    try {
      const tareasService = new TareasService(req.supabase, req.userId);
      const tareas = await tareasService.getProximas();
      
      res.json({
        success: true,
        data: tareas,
        count: tareas.length
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/tareas/:id
   * Obtener una tarea específica
   */
  async getTareaById(req, res, next) {
    try {
      const { id } = req.params;
      const tareasService = new TareasService(req.supabase, req.userId);
      const tarea = await tareasService.getById(parseInt(id));
      
      res.json({
        success: true,
        data: tarea
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/tareas
   * Crear una nueva tarea
   */
  async createTarea(req, res, next) {
    try {
      const tareasService = new TareasService(req.supabase, req.userId);
      const nuevaTarea = await tareasService.create(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Tarea creada exitosamente',
        data: nuevaTarea
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/tareas/:id
   * Actualizar una tarea existente
   */
  async updateTarea(req, res, next) {
    try {
      const { id } = req.params;
      const tareasService = new TareasService(req.supabase, req.userId);
      const tareaActualizada = await tareasService.update(parseInt(id), req.body);
      
      res.json({
        success: true,
        message: 'Tarea actualizada exitosamente',
        data: tareaActualizada
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/tareas/:id
   * Eliminar una tarea
   */
  async deleteTarea(req, res, next) {
    try {
      const { id } = req.params;
      const tareasService = new TareasService(req.supabase, req.userId);
      const resultado = await tareasService.delete(parseInt(id));
      
      res.json({
        success: true,
        message: resultado.message
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/tareas/:id/completar
   * Marcar tarea como completada
   */
  async completarTarea(req, res, next) {
    try {
      const { id } = req.params;
      const tareasService = new TareasService(req.supabase, req.userId);
      const tareaCompletada = await tareasService.completar(parseInt(id));
      
      res.json({
        success: true,
        message: 'Tarea marcada como completada',
        data: tareaCompletada
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = tareasController;