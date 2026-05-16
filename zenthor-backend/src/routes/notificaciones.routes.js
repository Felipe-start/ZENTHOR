const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Placeholder temporal
const configurarNotificaciones = (req, res) => {
  res.json({ success: true, message: 'Configuración guardada' });
};

const testNotificacion = (req, res) => {
  res.json({ success: true, message: 'Notificación de prueba enviada' });
};

router.post('/configurar', authMiddleware, configurarNotificaciones);
router.post('/test', authMiddleware, testNotificacion);

module.exports = router;
