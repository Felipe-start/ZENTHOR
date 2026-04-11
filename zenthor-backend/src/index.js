require('./config/env'); // PRIMERO SIEMPRE

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { enviarRecordatorios } = require('./recordatorios');



const materiasRoutes = require('./routes/materias.routes');
const errorHandler = require('./middleware/errorHandler');
const tareasRoutes = require('./routes/tareas.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(helmet());
app.use(cors());
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


// ENDPOINT DE Recordatorios

app.get('/test-recordatorios', async (req, res) => {
  await enviarRecordatorios();
  res.json({ ok: true });
});

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
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend de ZENTHOR corriendo en puerto ${PORT}`);
  console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ API disponible en http://localhost:${PORT}`);

  // 🔥 PROBAR RECORDATORIOS UNA VEZ
  enviarRecordatorios();

  // 🔁 (opcional después) cada minuto
  setInterval(() => {
    enviarRecordatorios();
  }, 60000);
});