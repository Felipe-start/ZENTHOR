const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');

// Rutas existentes
const examenesRoutes = require('./routes/examenes.routes');
const calendarioRoutes = require('./routes/calendario.routes');
const materiasRoutes = require('./routes/materias.routes');
const errorHandler = require('./middleware/errorHandler');
const tareasRoutes = require('./routes/tareas.routes');
const recordatoriosRoutes = require('./routes/recordatorios.routes');
const ragRoutes = require('./routes/rag.routes');

// Nuevas rutas
const conexionesRoutes = require('./routes/conexiones.routes');
const documentosRoutes = require('./routes/documentos.routes');
const notificacionesRoutes = require('./routes/notificaciones.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de sesiones
app.use(session({
  secret: process.env.JWT_SECRET || 'zenthor-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Configuración CORS
app.use(cors({
  origin: [
    'https://felipe-start.github.io',
    'http://localhost:4200',
    'https://*.app.github.dev',
    'https://zenthor.onrender.com',
    'https://special-giggle-r4pg4p79qjwq3pj7r-3000.app.github.dev'
  ],
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
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    supabase: process.env.SUPABASE_URL ? 'configured' : 'missing'
  });
});

// 🆕 Ruta raíz - Mensaje de bienvenida
app.get('/', (req, res) => {
  res.json({
    name: 'ZENTHOR Enterprise API',
    version: '2.0.0',
    status: 'online',
    server: {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      url: `https://special-giggle-r4pg4p79qjwq3pj7r-3000.app.github.dev`
    },
    endpoints: {
      health: '/health',
      materias: '/api/materias',
      tareas: '/api/tareas',
      examenes: '/api/examenes',
      calendario: '/api/calendario',
      recordatorios: '/api/recordatorios',
      rag: '/api/rag',
      conexiones: '/api/conexiones',
      documentos: '/api/documentos',
      notificaciones: '/api/notificaciones'
    },
    authentication: 'Bearer token required for most endpoints',
    documentation: 'https://github.com/Felipe-start/ZENTHOR',
    timestamp: new Date().toISOString()
  });
});

// 📌 RUTAS DE LA API
app.use('/api/materias', materiasRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/examenes', examenesRoutes);
app.use('/api/calendario', calendarioRoutes);
app.use('/api/recordatorios', recordatoriosRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/conexiones', conexionesRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// Ruta 404 - Para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta "${req.originalUrl}" no encontrada`,
    available_endpoints: [
      '/', '/health',
      '/api/materias', '/api/tareas', '/api/examenes',
      '/api/calendario', '/api/recordatorios', '/api/rag',
      '/api/conexiones', '/api/documentos', '/api/notificaciones'
    ]
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 ZENTHOR Enterprise API corriendo`);
  console.log(`📡 URL: https://special-giggle-r4pg4p79qjwq3pj7r-3000.app.github.dev`);
  console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: https://special-giggle-r4pg4p79qjwq3pj7r-3000.app.github.dev/health\n`);
});