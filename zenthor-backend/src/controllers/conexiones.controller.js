const { google } = require('googleapis');
const { supabaseAdmin, getSupabaseClient } = require('../config/supabase');

// Configurar OAuth2 client con credenciales de Google
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.API_URL || 'http://localhost:3000'}/api/conexiones/google/callback`
);

// Obtener estado de conexiones del usuario
const getConexiones = async (req, res) => {
  try {
    const supabase = getSupabaseClient(req.headers.authorization.split(' ')[1]);
    
    const { data, error } = await supabase
      .from('fuentes_conectadas')
      .select('tipo, activo, ultima_sincronizacion, nombre, created_at')
      .eq('usuario_id', req.userId);

    if (error) throw error;

    const estado = {
      google_classroom: { activo: false, ultima_sincronizacion: null, nombre: null },
      notion: { activo: false, ultima_sincronizacion: null, nombre: null },
      teams: { activo: false, ultima_sincronizacion: null, nombre: null },
      moodle: { activo: false, ultima_sincronizacion: null, nombre: null }
    };

    data.forEach(conn => {
      if (estado[conn.tipo]) {
        estado[conn.tipo] = {
          activo: conn.activo,
          ultima_sincronizacion: conn.ultima_sincronizacion,
          nombre: conn.nombre,
          creado: conn.created_at
        };
      }
    });

    res.json({ success: true, data: estado });
  } catch (error) {
    console.error('❌ Error getConexiones:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Iniciar OAuth con Google Classroom
const iniciarOAuthGoogle = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
      'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    state: req.userId,
    prompt: 'consent'
  });
  
  console.log(`🔐 Iniciando OAuth Google para usuario: ${req.userId}`);
  res.json({ success: true, url });
};

// Callback de Google OAuth
const callbackGoogle = async (req, res) => {
  const { code, state } = req.query;
  
  console.log(`📞 Callback Google recibido - Usuario: ${state}`);

  try {
    // Intercambiar code por tokens
    const { tokens } = await oauth2Client.getToken(code);
    console.log('✅ Tokens obtenidos');

    // Guardar en Supabase usando admin (bypass RLS)
    const { error: upsertError } = await supabaseAdmin
      .from('fuentes_conectadas')
      .upsert({
        usuario_id: state,
        tipo: 'google_classroom',
        nombre: 'Google Classroom',
        configuracion: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date
        },
        activo: true,
        ultima_sincronizacion: new Date()
      });

    if (upsertError) throw upsertError;
    console.log('✅ Configuración guardada en Supabase');

    // Redirigir al frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const redirectUrl = `${frontendUrl}/conexiones?success=google`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const redirectUrl = `${frontendUrl}/conexiones?error=google&message=${encodeURIComponent(error.message)}`;
    res.redirect(redirectUrl);
  }
};

// Configurar Moodle manualmente
const configurarMoodle = async (req, res) => {
  const { moodle_url, moodle_token } = req.body;

  if (!moodle_url || !moodle_token) {
    return res.status(400).json({ 
      success: false, 
      error: 'URL y token de Moodle son requeridos' 
    });
  }

  try {
    // Validar URL
    try {
      new URL(moodle_url);
    } catch {
      return res.status(400).json({ 
        success: false, 
        error: 'URL de Moodle inválida' 
      });
    }

    await supabaseAdmin
      .from('fuentes_conectadas')
      .upsert({
        usuario_id: req.userId,
        tipo: 'moodle',
        nombre: `Moodle: ${new URL(moodle_url).hostname}`,
        configuracion: { url: moodle_url, token: moodle_token },
        activo: true,
        ultima_sincronizacion: new Date()
      });

    res.json({ 
      success: true, 
      mensaje: '✅ Moodle configurado correctamente' 
    });
  } catch (error) {
    console.error('❌ Error configurarMoodle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Sincronizar Google Classroom manualmente
const syncGoogleClassroom = async (req, res) => {
  try {
    // Obtener la conexión guardada
    const { data: conexion, error: connError } = await supabaseAdmin
      .from('fuentes_conectadas')
      .select('configuracion')
      .eq('usuario_id', req.userId)
      .eq('tipo', 'google_classroom')
      .single();

    if (connError || !conexion) {
      return res.status(404).json({ 
        success: false, 
        error: 'Google Classroom no está conectado' 
      });
    }

    const { access_token, refresh_token } = conexion.configuracion;
    
    // Configurar OAuth con los tokens guardados
    oauth2Client.setCredentials({
      access_token: access_token,
      refresh_token: refresh_token
    });

    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });
    
    // Obtener cursos
    const coursesRes = await classroom.courses.list({ pageSize: 50 });
    const courses = coursesRes.data.courses || [];
    
    console.log(`📚 Encontrados ${courses.length} cursos para sincronizar`);

    const supabase = getSupabaseClient(req.headers.authorization.split(' ')[1]);
    let tareasSincronizadas = 0;

    for (const course of courses) {
      // Crear o actualizar materia
      const { data: materia, error: materiaError } = await supabase
        .from('materias')
        .upsert({
          usuario_id: req.userId,
          nombre: course.name,
          profesor: course.teacherGroupEmail || 'Profesor',
          color: getRandomColor(),
          activo: course.courseState === 'ACTIVE',
          metadata: { google_id: course.id, source: 'classroom' }
        })
        .select()
        .single();

      if (materiaError) {
        console.error('Error guardando materia:', materiaError);
        continue;
      }

      // Obtener trabajos del curso
      const courseworkRes = await classroom.courses.courseWork.list({
        courseId: course.id,
        pageSize: 50
      });
      const works = courseworkRes.data.courseWork || [];

      for (const work of works) {
        if (work.dueDate) {
          const dueDate = new Date(
            work.dueDate.year,
            work.dueDate.month - 1,
            work.dueDate.day,
            work.dueTime?.hours || 23,
            work.dueTime?.minutes || 59
          );

          await supabase
            .from('tareas')
            .upsert({
              usuario_id: req.userId,
              materia_id: materia.id,
              titulo: work.title,
              descripcion: work.description || '',
              fecha_entrega: dueDate,
              estado: work.state === 'PUBLISHED' ? 'pendiente' : 'completada',
              prioridad: 'media',
              metadata: { google_id: work.id, source: 'classroom' }
            });
          
          tareasSincronizadas++;
        }
      }
    }

    // Actualizar última sincronización
    await supabaseAdmin
      .from('fuentes_conectadas')
      .update({ ultima_sincronizacion: new Date() })
      .eq('usuario_id', req.userId)
      .eq('tipo', 'google_classroom');

    res.json({ 
      success: true, 
      mensaje: `✅ Sincronización completada: ${courses.length} cursos, ${tareasSincronizadas} tareas` 
    });

  } catch (error) {
    console.error('❌ Error syncGoogleClassroom:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Desconectar una fuente
const desconectar = async (req, res) => {
  const { tipo } = req.params;

  const tiposPermitidos = ['google_classroom', 'notion', 'teams', 'moodle'];
  if (!tiposPermitidos.includes(tipo)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Tipo de fuente no válido' 
    });
  }

  try {
    await supabaseAdmin
      .from('fuentes_conectadas')
      .update({ activo: false })
      .eq('usuario_id', req.userId)
      .eq('tipo', tipo);

    res.json({ 
      success: true, 
      mensaje: `✅ ${tipo} desconectado correctamente` 
    });
  } catch (error) {
    console.error('❌ Error desconectar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Función auxiliar para colores aleatorios
const getRandomColor = () => {
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  return colors[Math.floor(Math.random() * colors.length)];
};

module.exports = {
  getConexiones,
  iniciarOAuthGoogle,
  callbackGoogle,
  configurarMoodle,
  syncGoogleClassroom,
  desconectar
};