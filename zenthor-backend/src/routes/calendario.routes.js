const express = require('express');
const router = express.Router();
const calendarioController = require('../controllers/calendario.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);
router.get('/eventos', calendarioController.getEventos);

module.exports = router;