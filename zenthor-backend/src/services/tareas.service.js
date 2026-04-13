const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar transporter para correos
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class TareasService {
  constructor(supabaseClient, userId) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  // Función para enviar correo de confirmación de tarea creada
  async enviarCorreoCreacionTarea(email, tarea, materiaNombre) {
    const prioridadIconos = { baja: '🟢', media: '🟡', alta: '🔴' };
    const prioridadColores = { baja: '#10b981', media: '#f59e0b', alta: '#ef4444' };

    const fechaEntrega = new Date(tarea.fecha_entrega);
    const fechaFormateada = fechaEntrega.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const horaFormateada = fechaEntrega.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const LOGO_URL = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/assets/images/LOGO.jpg`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Nueva Tarea - ZENTHOR</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.15);
          }
          .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
            padding: 32px;
            text-align: center;
          }
          .logo {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            margin: 0 auto 16px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo img {
            width: 70px;
            height: 70px;
            border-radius: 16px;
            object-fit: cover;
          }
          .header h1 {
            color: white;
            font-size: 24px;
            margin: 0;
            font-weight: 700;
          }
          .header p {
            color: rgba(255,255,255,0.9);
            margin: 8px 0 0;
          }
          .success-badge {
            background: linear-gradient(135deg, #dcfce7, #bbf7d0);
            color: #15803d;
            padding: 8px 16px;
            border-radius: 40px;
            display: inline-block;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .task-title {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 16px;
          }
          .task-details {
            background: #f9fafb;
            border-radius: 16px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #4b5563;
          }
          .detail-value {
            color: #1f2937;
          }
          .priority-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            background: ${prioridadColores[tarea.prioridad] || '#6b7280'};
            color: white;
          }
          .materia-tag {
            display: inline-block;
            background: #eef2ff;
            color: #4f46e5;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            padding: 24px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="${LOGO_URL}" alt="ZENTHOR" onerror="this.src='https://via.placeholder.com/70x70?text=Z'">
            </div>
            <h1>✅ Nueva Tarea Creada</h1>
            <p>ZENTHOR - Organiza tu vida académica</p>
          </div>
          <div class="content">
            <div class="success-badge">
              🎉 ¡Tarea registrada exitosamente!
            </div>
            <div class="task-title">
              ${prioridadIconos[tarea.prioridad] || '📌'} ${escapeHtml(tarea.titulo)}
            </div>
            <div class="task-details">
              <div class="detail-row">
                <span class="detail-label">📚 Materia:</span>
                <span class="detail-value"><span class="materia-tag">${escapeHtml(materiaNombre)}</span></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📅 Fecha de entrega:</span>
                <span class="detail-value">${fechaFormateada}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">⏰ Hora:</span>
                <span class="detail-value">${horaFormateada}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🎯 Prioridad:</span>
                <span class="detail-value"><span class="priority-badge">${tarea.prioridad?.toUpperCase() || 'MEDIA'}</span></span>
              </div>
              ${tarea.descripcion ? `
              <div class="detail-row">
                <span class="detail-label">📝 Descripción:</span>
                <span class="detail-value">${escapeHtml(tarea.descripcion.substring(0, 200))}${tarea.descripcion.length > 200 ? '...' : ''}</span>
              </div>
              ` : ''}
            </div>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/tareas" class="button">
                ✨ Ver mis tareas ✨
              </a>
            </div>
          </div>
          <div class="footer">
            <p>Recibirás recordatorios 24 horas y 1 hora antes de la fecha de entrega.</p>
            <p>© ${new Date().getFullYear()} ZENTHOR - Todos los derechos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: `"ZENTHOR" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `✅ Nueva tarea: ${tarea.titulo} - ZENTHOR`,
        html: html
      });
      console.log(`✅ Correo de confirmación enviado a ${email}`);
      return true;
    } catch (error) {
      console.error(`❌ Error enviando correo de confirmación:`, error.message);
      return false;
    }
  }

  // Función para obtener el email del usuario
  async obtenerEmailUsuario(usuarioId) {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(usuarioId);
    return authUser?.user?.email;
  }

  /**
   * Obtener todas las tareas del usuario con filtros opcionales
   */
  async getAll(filters = {}) {
    let query = this.supabase
      .from('tareas')
      .select(`
        *,
        materias (
          nombre,
          color
        )
      `)
      .eq('usuario_id', this.userId);

    if (filters.materia_id) {
      query = query.eq('materia_id', filters.materia_id);
    }
    if (filters.estado) {
      query = query.eq('estado', filters.estado);
    }
    if (filters.prioridad) {
      query = query.eq('prioridad', filters.prioridad);
    }

    const { data, error } = await query.order('fecha_entrega', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener tareas: ${error.message}`);
    }

    return data.map(tarea => ({
      ...tarea,
      materia_nombre: tarea.materias?.nombre || 'Sin materia',
      materia_color: tarea.materias?.color || '#6c757d',
      materias: undefined
    }));
  }

  /**
   * Obtener tareas de los próximos 7 días
   */
  async getProximas() {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const { data, error } = await this.supabase
      .from('tareas')
      .select(`
        *,
        materias (
          nombre,
          color
        )
      `)
      .eq('usuario_id', this.userId)
      .eq('estado', 'pendiente')
      .gte('fecha_entrega', today.toISOString())
      .lte('fecha_entrega', nextWeek.toISOString())
      .order('fecha_entrega', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener tareas próximas: ${error.message}`);
    }

    return data.map(tarea => ({
      ...tarea,
      materia_nombre: tarea.materias?.nombre || 'Sin materia',
      materia_color: tarea.materias?.color || '#6c757d',
      materias: undefined
    }));
  }

  /**
   * Obtener una tarea por ID
   */
  async getById(id) {
    const { data, error } = await this.supabase
      .from('tareas')
      .select(`
        *,
        materias (
          nombre,
          color
        )
      `)
      .eq('id', id)
      .eq('usuario_id', this.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Tarea no encontrada');
      }
      throw new Error(`Error al obtener tarea: ${error.message}`);
    }

    return {
      ...data,
      materia_nombre: data.materias?.nombre || 'Sin materia',
      materia_color: data.materias?.color || '#6c757d',
      materias: undefined
    };
  }

  /**
   * Validar materia
   */
  async verificarMateria(materiaId) {
    const { data, error } = await this.supabase
      .from('materias')
      .select('id, nombre')
      .eq('id', materiaId)
      .eq('usuario_id', this.userId)
      .single();

    if (error || !data) {
      throw new Error('La materia no existe o no te pertenece');
    }
    return data;
  }

  /**
   * Crear una nueva tarea (MODIFICADO - ahora envía correo)
   */
  async create(tareaData) {
    // Validar materia y obtener su nombre
    const materia = await this.verificarMateria(tareaData.materia_id);

    const { data, error } = await this.supabase
      .from('tareas')
      .insert({
        usuario_id: this.userId,
        materia_id: tareaData.materia_id,
        titulo: tareaData.titulo,
        descripcion: tareaData.descripcion || null,
        fecha_entrega: tareaData.fecha_entrega,
        prioridad: tareaData.prioridad || 'media',
        estado: 'pendiente'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear tarea: ${error.message}`);
    }

    // Enviar correo de confirmación al usuario
    try {
      const email = await this.obtenerEmailUsuario(this.userId);
      if (email) {
        await this.enviarCorreoCreacionTarea(email, data, materia.nombre);
      }
    } catch (emailError) {
      console.error('Error enviando correo de confirmación:', emailError);
      // No lanzamos error para que la tarea se cree igual
    }

    return data;
  }

  /**
   * Actualizar tarea
   */
  async update(id, updateData) {
    await this.getById(id);

    if (updateData.materia_id) {
      await this.verificarMateria(updateData.materia_id);
    }

    const { data, error } = await this.supabase
      .from('tareas')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('usuario_id', this.userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar tarea: ${error.message}`);
    }

    return data;
  }

  /**
   * Marcar tarea como completada
   */
  async completar(id) {
    await this.getById(id);

    const { data, error } = await this.supabase
      .from('tareas')
      .update({
        estado: 'completada',
        fecha_completado: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('usuario_id', this.userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al completar tarea: ${error.message}`);
    }

    return data;
  }

  /**
   * Eliminar tarea
   */
  async delete(id) {
    await this.getById(id);

    const { error } = await this.supabase
      .from('tareas')
      .delete()
      .eq('id', id)
      .eq('usuario_id', this.userId);

    if (error) {
      throw new Error(`Error al eliminar tarea: ${error.message}`);
    }

    return { message: 'Tarea eliminada correctamente' };
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = TareasService;
