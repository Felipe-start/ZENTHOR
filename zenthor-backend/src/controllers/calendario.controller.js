const TareasService = require('../services/tareas.service');
const ExamenesService = require('../services/examenes.service');

const calendarioController = {
  async getEventos(req, res, next) {
    try {
      const tareasService = new TareasService(req.supabase, req.userId);
      const examenesService = new ExamenesService(req.supabase, req.userId);
      
      const [tareas, examenes] = await Promise.all([
        tareasService.getAll({}),
        examenesService.getAll()
      ]);
      
      const ahora = new Date();
      const eventos = [];

      // Tareas
      for (const t of tareas) {
        const fechaEntrega = new Date(t.fecha_entrega);
        let estado = 'pendiente';
        if (fechaEntrega < ahora) estado = 'atrasada';
        else if (t.estado === 'completada') estado = 'completada';
        else if ((fechaEntrega - ahora) / (1000 * 60 * 60) < 24) estado = 'por_caducar';

        eventos.push({
          id: `tarea-${t.id}`,
          title: t.titulo,
          start: t.fecha_entrega,
          end: t.fecha_entrega,
          color: t.materia_color,
          extendedProps: {
            type: 'tarea',
            materia: t.materia_nombre,
            descripcion: t.descripcion,
            prioridad: t.prioridad,
            estado: estado,
            originalId: t.id
          }
        });
      }

      // Exámenes
      for (const e of examenes) {
        eventos.push({
          id: `examen-${e.id}`,
          title: `📝 ${e.materia_nombre}`,
          start: e.fecha_examen,
          end: e.fecha_examen,
          color: e.materia_color,
          extendedProps: {
            type: 'examen',
            materia: e.materia_nombre,
            aula: e.aula,
            temas: e.temas,
            originalId: e.id
          }
        });
      }
      
      res.json(eventos);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = calendarioController;