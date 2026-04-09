const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function isEmailConfigured() {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
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

// URL del logo real de ZENTHOR (cambia por la URL de tu logo JPG)
// Opción 1: Usar el logo del frontend (si está disponible públicamente)
const LOGO_URL = 'https://curly-goggles-6946jpjvppp93rxrv-4200.app.github.dev/assets/images/ LOGO Z.jpg';

// Opción 2: Si el logo no es accesible públicamente, usar base64
// Puedes convertir tu JPG a base64 con: base64 -w0 logo.jpg

async function enviarRecordatorio(email, tarea, tipo) {
  const tiempoRestante = tipo === '24h' ? '24 horas' : '1 hora';
  const prioridadColores = {
    baja: '#10b981',
    media: '#f59e0b',
    alta: '#ef4444'
  };
  const prioridadIconos = {
    baja: '🟢',
    media: '🟡',
    alta: '🔴'
  };

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

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Recordatorio ZENTHOR</title>
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
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
        .content {
          padding: 32px;
        }
        .alert-badge {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #dc2626;
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
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
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
          <h1>📋 Recordatorio de Tarea</h1>
          <p>ZENTHOR - Organiza tu vida académica</p>
        </div>
        <div class="content">
          <div class="alert-badge">
            ⏰ ¡Recordatorio de ${tiempoRestante}!
          </div>
          <div class="task-title">
            ${prioridadIconos[tarea.prioridad] || '📌'} ${escapeHtml(tarea.titulo)}
          </div>
          <div class="task-details">
            <div class="detail-row">
              <span class="detail-label">📚 Materia:</span>
              <span class="detail-value"><span class="materia-tag">${escapeHtml(tarea.materias?.nombre || 'Sin materia')}</span></span>
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
          <p>Este es un recordatorio automático de ZENTHOR Enterprise.</p>
          <p>© ${new Date().getFullYear()} ZENTHOR - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ZENTHOR Enterprise - Recordatorio de Tarea
    ==========================================
    
    ⏰ ¡Recordatorio de ${tiempoRestante}!
    
    Tarea: ${tarea.titulo}
    Materia: ${tarea.materias?.nombre || 'Sin materia'}
    Fecha de entrega: ${fechaFormateada}
    Hora: ${horaFormateada}
    Prioridad: ${tarea.prioridad?.toUpperCase() || 'MEDIA'}
    
    ${tarea.descripcion ? `Descripción: ${tarea.descripcion}` : ''}
    
    Visita ZENTHOR para más detalles:
    ${process.env.FRONTEND_URL || 'http://localhost:4200'}/tareas
  `;

  try {
    const info = await transporter.sendMail({
      from: `"ZENTHOR Enterprise" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `📋 ${prioridadIconos[tarea.prioridad] || '📌'} ${tarea.titulo} - ZENTHOR Enterprise`,
      text: text,
      html: html
    });
    console.log(`✅ Email enviado a ${email} para: ${tarea.titulo}`);
    return true;
  } catch (error) {
    console.error(`❌ Error enviando email:`, error.message);
    return false;
  }
}

async function verificarYEnviarRecordatorios() {
  try {
    console.log('🔍 Verificando recordatorios...', new Date().toISOString());
    
    if (!isEmailConfigured()) {
      console.log('⚠️ Email no configurado');
      return;
    }
    
    const ahora = new Date();

    const { data: tareas, error } = await supabaseAdmin
      .from('tareas')
      .select(`
        *,
        materias (nombre, color)
      `)
      .eq('estado', 'pendiente')
      .gte('fecha_entrega', ahora.toISOString());

    if (error) {
      console.error('Error obteniendo tareas:', error);
      return;
    }

    console.log(`📊 Revisando ${tareas?.length || 0} tareas pendientes`);

    for (const tarea of tareas || []) {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(tarea.usuario_id);
      
      if (authError || !authUser?.user?.email) {
        console.error(`❌ No se pudo obtener email para usuario ${tarea.usuario_id}`);
        continue;
      }

      const email = authUser.user.email;
      const fechaEntrega = new Date(tarea.fecha_entrega);
      const horasRestantes = (fechaEntrega - ahora) / (1000 * 60 * 60);

      if (horasRestantes <= 24.5 && horasRestantes >= 23.5) {
        console.log(`📧 Enviando recordatorio 24h para: ${tarea.titulo} -> ${email}`);
        await enviarRecordatorio(email, tarea, '24h');
      }
      
      if (horasRestantes <= 1.5 && horasRestantes >= 0.5) {
        console.log(`📧 Enviando recordatorio 1h para: ${tarea.titulo} -> ${email}`);
        await enviarRecordatorio(email, tarea, '1h');
      }
    }
    
    console.log('✅ Verificación completada');
  } catch (error) {
    console.error('Error en verificación:', error);
  }
}

if (process.argv.includes('--once')) {
  verificarYEnviarRecordatorios().then(() => process.exit(0));
} else {
  verificarYEnviarRecordatorios();
  setInterval(verificarYEnviarRecordatorios, 60 * 60 * 1000);
  console.log('🕐 Servicio de recordatorios iniciado (modo continuo)');
  console.log('📧 Se enviarán correos automáticamente cada hora');
}
