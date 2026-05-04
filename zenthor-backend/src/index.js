const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const examenesRoutes = require('./routes/examenes.routes');
const calendarioRoutes = require('./routes/calendario.routes');
const materiasRoutes = require('./routes/materias.routes');
const errorHandler = require('./middleware/errorHandler');
const tareasRoutes = require('./routes/tareas.routes');
const recordatoriosRoutes = require('./routes/recordatorios.routes');
const ragRoutes = require('./routes/rag.routes');


const app = express();
const PORT = process.env.PORT || 3000;

// Configuración CORS - PERMITIR TODOS LOS ORÍGENES (para desarrollo)
app.use(cors({
  origin: ['https://felipe-start.github.io', 'http://localhost:4200', 'https://*.app.github.dev'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rutas de la API
app.use('/api/materias', materiasRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/examenes', examenesRoutes);
app.use('/api/calendario', calendarioRoutes);
app.use('/api/recordatorios', recordatoriosRoutes);
app.use('/api/rag', ragRoutes);

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor backend de ZENTHOR corriendo en puerto ${PORT}`);
  console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ API disponible en http://localhost:${PORT}`);
  console.log(`🌐 CORS: Permitido desde cualquier origen`);
});
