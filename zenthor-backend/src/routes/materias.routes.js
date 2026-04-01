const express = require('express');
const router = express.Router();
const materiasController = require('../controllers/materias.controller');
const authMiddleware = require('../middleware/auth');
const {
  validateCreateMateria,
  validateUpdateMateria
} = require('../validators/materias.validator');

// Todas las rutas de materias requieren autenticación
router.use(authMiddleware);

// Rutas CRUD principales
router.get('/', materiasController.getAllMaterias);
router.get('/:id', materiasController.getMateriaById);
router.post('/', validateCreateMateria, materiasController.createMateria);
router.put('/:id', validateUpdateMateria, materiasController.updateMateria);
router.delete('/:id', materiasController.deleteMateria);

// Rutas adicionales
router.post('/:id/restore', materiasController.restoreMateria);
router.get('/:id/stats', materiasController.getMateriaStats);

module.exports = router;
