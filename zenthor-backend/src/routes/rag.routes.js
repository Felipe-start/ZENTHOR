const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Controladores (asegurémonos de que existan)
let chat, generarGuia;

try {
  const ragController = require('../controllers/rag.controller');
  chat = ragController.chat;
  generarGuia = ragController.generarGuia;
} catch (error) {
  console.warn('⚠️ Controlador RAG no encontrado, creando funciones temporales');
  chat = (req, res) => res.status(501).json({ error: 'Chat RAG no implementado aún' });
  generarGuia = (req, res) => res.status(501).json({ error: 'Generador de guías no implementado aún' });
}

// Rutas RAG
router.post('/chat', authMiddleware, chat);
router.post('/generar-guia', authMiddleware, generarGuia);

module.exports = router;