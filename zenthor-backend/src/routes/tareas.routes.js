const express = require('express');
const router = express.Router();
const tareasController = require('../controllers/tareas.controller');
const authMiddleware = require('../middleware/auth');
const {
  validateCreateTarea,
  validateUpdateTarea
} = require('../validators/tareas.validator');

// Todas las rutas de tareas requieren autenticación
router.use(authMiddleware);

// Rutas principales
router.get('/', tareasController.getAllTareas);
router.get('/proximas', tareasController.getTareasProximas);
router.get('/:id', tareasController.getTareaById);
router.post('/', validateCreateTarea, tareasController.createTarea);
router.put('/:id', validateUpdateTarea, tareasController.updateTarea);
router.delete('/:id', tareasController.deleteTarea);
router.put('/:id/completar', tareasController.completarTarea);

module.exports = router;