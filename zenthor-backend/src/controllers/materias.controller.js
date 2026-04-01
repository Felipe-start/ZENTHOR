const MateriasService = require('../services/materias.service');

/**
 * Controlador para manejar las operaciones CRUD de materias
 */
const materiasController = {
  /**
   * GET /api/materias
   * Obtener todas las materias activas del usuario
   */
  async getAllMaterias(req, res, next) {
    try {
      const materiasService = new MateriasService(req.supabase, req.userId);
      const materias = await materiasService.getAll();
      
      res.json({
        success: true,
        data: materias,
        count: materias.length
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/materias/:id
   * Obtener una materia específica por ID
   */
  async getMateriaById(req, res, next) {
    try {
      const { id } = req.params;
      const materiasService = new MateriasService(req.supabase, req.userId);
      const materia = await materiasService.getById(parseInt(id));
      
      res.json({
        success: true,
        data: materia
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/materias
   * Crear una nueva materia
   */
  async createMateria(req, res, next) {
    try {
      const materiasService = new MateriasService(req.supabase, req.userId);
      const nuevaMateria = await materiasService.create(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Materia creada exitosamente',
        data: nuevaMateria
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/materias/:id
   * Actualizar una materia existente
   */
  async updateMateria(req, res, next) {
    try {
      const { id } = req.params;
      const materiasService = new MateriasService(req.supabase, req.userId);
      const materiaActualizada = await materiasService.update(parseInt(id), req.body);
      
      res.json({
        success: true,
        message: 'Materia actualizada exitosamente',
        data: materiaActualizada
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/materias/:id
   * Eliminar lógicamente una materia
   */
  async deleteMateria(req, res, next) {
    try {
      const { id } = req.params;
      const materiasService = new MateriasService(req.supabase, req.userId);
      const resultado = await materiasService.delete(parseInt(id));
      
      res.json({
        success: true,
        message: resultado.message,
        data: resultado.materia
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/materias/:id/restore
   * Restaurar una materia eliminada lógicamente
   */
  async restoreMateria(req, res, next) {
    try {
      const { id } = req.params;
      const materiasService = new MateriasService(req.supabase, req.userId);
      const resultado = await materiasService.restore(parseInt(id));
      
      res.json({
        success: true,
        message: resultado.message,
        data: resultado.materia
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/materias/:id/stats
   * Obtener estadísticas de una materia
   */
  async getMateriaStats(req, res, next) {
    try {
      const { id } = req.params;
      const materiasService = new MateriasService(req.supabase, req.userId);
      const stats = await materiasService.getStats(parseInt(id));
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = materiasController;
