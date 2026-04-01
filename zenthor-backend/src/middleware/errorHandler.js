/**
 * Middleware para manejar errores globalmente
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Errores específicos de Supabase
  if (err.message && err.message.includes('Supabase')) {
    return res.status(500).json({
      success: false,
      message: 'Error en la base de datos',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  // Errores de validación de Joi ya son manejados por el validador
  // pero por si acaso
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: err.details[0].message
    });
  }
  
  // Errores de negocio (como "Materia no encontrada")
  if (err.message === 'Materia no encontrada') {
    return res.status(404).json({
      success: false,
      message: err.message
    });
  }
  
  // Error genérico
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
