const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getConexiones,
  iniciarOAuthGoogle,
  callbackGoogle,
  configurarMoodle,
  syncGoogleClassroom,
  desconectar
} = require('../controllers/conexiones.controller');

// ✅ Rutas correctas para conexiones
router.get('/', authMiddleware, getConexiones);
router.get('/google/iniciar', authMiddleware, iniciarOAuthGoogle);
router.get('/google/callback', callbackGoogle);
router.post('/moodle', authMiddleware, configurarMoodle);
router.post('/google/sync', authMiddleware, syncGoogleClassroom);
router.delete('/:tipo', authMiddleware, desconectar);

module.exports = router;