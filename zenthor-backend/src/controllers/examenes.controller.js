const ExamenesService = require('../services/examenes.service');

const examenesController = {
  async getAll(req, res, next) {
    try {
      const service = new ExamenesService(req.supabase, req.userId);
      const examenes = await service.getAll();
      res.json({ success: true, data: examenes, count: examenes.length });
    } catch (error) { next(error); }
  },
  async getProximos(req, res, next) {
    try {
      const service = new ExamenesService(req.supabase, req.userId);
      const examenes = await service.getProximos();
      res.json({ success: true, data: examenes, count: examenes.length });
    } catch (error) { next(error); }
  },
  async getById(req, res, next) {
    try {
      const service = new ExamenesService(req.supabase, req.userId);
      const examen = await service.getById(parseInt(req.params.id));
      res.json({ success: true, data: examen });
    } catch (error) { next(error); }
  },
  async create(req, res, next) {
    try {
      const service = new ExamenesService(req.supabase, req.userId);
      const nuevo = await service.create(req.body);
      res.status(201).json({ success: true, message: 'Examen creado', data: nuevo });
    } catch (error) { next(error); }
  },
  async update(req, res, next) {
    try {
      const service = new ExamenesService(req.supabase, req.userId);
      const actualizado = await service.update(parseInt(req.params.id), req.body);
      res.json({ success: true, message: 'Examen actualizado', data: actualizado });
    } catch (error) { next(error); }
  },
  async delete(req, res, next) {
    try {
      const service = new ExamenesService(req.supabase, req.userId);
      const resultado = await service.delete(parseInt(req.params.id));
      res.json({ success: true, message: resultado.message });
    } catch (error) { next(error); }
  }
};

module.exports = examenesController;