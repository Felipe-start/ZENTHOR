const { getSupabaseClient } = require('../config/supabase');

/**
 * Middleware para verificar token JWT y obtener usuario autenticado
 * Este middleware debe usarse en todas las rutas protegidas
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Crear cliente autenticado con el token del usuario
    const supabase = getSupabaseClient(token);
    
    // Verificar token y obtener usuario
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('Error de autenticación:', error);
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
    
    // Adjuntar usuario y cliente autenticado al request
    req.user = user;
    req.supabase = supabase;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = authMiddleware;
