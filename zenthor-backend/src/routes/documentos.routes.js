const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  upload,
  previsualizarDocumento,
  confirmarSubida,
  getDocumentos,
  eliminarDocumento
} = require('../controllers/documentos.controller');

// ✅ Rutas CORRECTAS
router.post('/previsualizar', authMiddleware, upload.single('documento'), previsualizarDocumento);
router.post('/confirmar', authMiddleware, confirmarSubida);
router.post('/upload', authMiddleware, upload.single('documento'), async (req, res) => {
  // Redirigir a previsualizar o directamente subir
  const { titulo, fuente } = req.body;
  // Implementación directa
});
router.get('/', authMiddleware, getDocumentos);
router.delete('/:id', authMiddleware, eliminarDocumento);

module.exports = router;