const { getSupabaseClient } = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔍 Auth Header recibido:', authHeader ? 'Presente' : 'Ausente');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Token no proporcionado o formato incorrecto');
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 Token recibido (primeros 20 chars):', token.substring(0, 20) + '...');
    
    try {
      const supabase = getSupabaseClient(token);
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ Error de Supabase:', error.message);
        return res.status(401).json({
          success: false,
          message: `Token inválido: ${error.message}`
        });
      }
      
      if (!user) {
        console.error('❌ Usuario no encontrado');
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      console.log('✅ Usuario autenticado:', user.id);
      req.user = user;
      req.supabase = supabase;
      req.userId = user.id;
      
      next();
    } catch (verifyError) {
      console.error('❌ Error verificando token:', verifyError.message);
      return res.status(401).json({
        success: false,
        message: 'Error verificando token'
      });
    }
  } catch (error) {
    console.error('❌ Error en middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = authMiddleware;