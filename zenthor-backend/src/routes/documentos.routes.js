const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Placeholder temporal
const uploadDocumento = (req, res) => {
  res.json({ success: true, message: 'Documento subido (placeholder)' });
};

const getDocumentos = (req, res) => {
  res.json({ success: true, data: [] });
};

const deleteDocumento = (req, res) => {
  res.json({ success: true, message: `Documento ${req.params.id} eliminado` });
};

router.post('/upload', authMiddleware, uploadDocumento);
router.get('/', authMiddleware, getDocumentos);
router.delete('/:id', authMiddleware, deleteDocumento);

module.exports = router;