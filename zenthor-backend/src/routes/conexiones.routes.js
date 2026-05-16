const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Placeholder temporal - reemplazar cuando tengas el controlador
const getConexiones = (req, res) => {
  res.json({ 
    success: true, 
    message: 'Conexiones - Endpoint en desarrollo',
    data: {
      google_classroom: { activo: false },
      notion: { activo: false },
      teams: { activo: false },
      moodle: { activo: false }
    }
  });
};

const iniciarOAuthGoogle = (req, res) => {
  res.json({ 
    success: true, 
    url: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test&redirect_uri=test&response_type=code&scope=email&access_type=offline'
  });
};

const callbackGoogle = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4200'}/conexiones?success=google`);
};

const configurarMoodle = (req, res) => {
  res.json({ success: true, message: 'Moodle configurado' });
};

const desconectar = (req, res) => {
  res.json({ success: true, message: `Desconectado ${req.params.tipo}` });
};

router.get('/', authMiddleware, getConexiones);
router.get('/google/iniciar', authMiddleware, iniciarOAuthGoogle);
router.get('/google/callback', callbackGoogle);
router.post('/moodle', authMiddleware, configurarMoodle);
router.delete('/:tipo', authMiddleware, desconectar);

module.exports = router;