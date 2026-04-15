const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const nodemailer = require('nodemailer');
const { supabaseAdmin } = require('./config/supabase');

// Configuración de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Logo de ZENTHOR desde Supabase Storage
const LOGO_URL = 'https://mihxvrcztlluwnbbzfhh.supabase.co/storage/v1/object/public/logos/LOGO.jpg';

// Función para generar plantilla HTML de correo
function generarPlantillaEmail(tipo, datos, horasRestantes) {
  const tiempoTexto = horasRestantes <= 0.5 ? 'menos de 30 minutos' :
                      horasRestantes <= 1 ? '1 hora' :
                      horasRestantes <= 24 ? '24 horas' : `${Math.round(horasRestantes)} horas`;
  
  const emoji = tipo === 'tarea' ? '📋' : '📝';
  const titulo = tipo === 'tarea' ? `Tarea: ${datos.titulo}` : `Examen: ${datos.materia}`;
  const mensaje = tipo === 'tarea'
    ? `Tu tarea "${datos.titulo}" de la materia ${datos.materia} está próxima a vencer en ${tiempoTexto}.`
    : `Tienes un examen de ${datos.materia} en ${tiempoTexto}.`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Recordatorio ZENTHOR</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
          margin: 0;
          padding: 40px 20px;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
          background: white;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          padding: 12px;
        }
        .logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 12px;
        }
        .header h1 {
          color: white;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .header p {
          color: rgba(255,255,255,0.9);
          font-size: 14px;
        }
        .content {
          padding: 32px;
        }
        .alert-badge {
          background: #fee2e2;
          color: #dc2626;
          padding: 8px 16px;
          border-radius: 40px;
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .event-title {
          font-size: 22px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .details-card {
          background: #f9fafb;
          border-radius: 20px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid ${datos.color || '#6366f1'};
        }
        .detail-row {
          display: flex;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          width: 100px;
          font-weight: 600;
          color: #4b5563;
        }
        .detail-value {
          flex: 1;
          color: #1f2937;
        }
        .priority-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          background: ${datos.prioridad === 'alta' ? '#fee2e2' : datos.prioridad === 'media' ? '#fef3c7' : '#dcfce7'};
          color: ${datos.prioridad === 'alta' ? '#dc2626' : datos.prioridad === 'media' ? '#d97706' : '#10b981'};
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 12px 28px;
          border-radius: 40px;
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
        @media (max-width: 480px) {
          .container { border-radius: 20px; }
          .content { padding: 24px; }
          .event-title { font-size: 18px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="${LOGO_URL}" alt="ZENTHOR">
          </div>
          <h1>${emoji} Recordatorio Académico</h1>
          <p>ZENTHOR - Tu compañero de estudio inteligente</p>
        </div>
        <div class="content">
          <div class="alert-badge">
            ⏰ ¡Recordatorio de ${tiempoTexto}!
          </div>
          <div class="event-title">
            ${titulo}
          </div>
          <div class="details-card">
            <div class="detail-row">
              <div class="detail-label">📚 Materia</div>
              <div class="detail-value">${datos.materia}</div>
            </div>
            ${tipo === 'tarea' ? `
            <div class="detail-row">
              <div class="detail-label">📅 Fecha entrega</div>
              <div class="detail-value">${new Date(datos.fecha).toLocaleString()}</div>
            </div>
            ` : `
            <div class="detail-row">
              <div class="detail-label">📅 Fecha examen</div>
              <div class="detail-value">${new Date(datos.fecha).toLocaleString()}</div>
            </div>
            `}
            ${datos.prioridad ? `
            <div class="detail-row">
              <div class="detail-label">⚡ Prioridad</div>
              <div class="detail-value"><span class="priority-badge">${datos.prioridad.toUpperCase()}</span></div>
            </div>
            ` : ''}
            ${datos.aula ? `
            <div class="detail-row">
              <div class="detail-label">🏫 Aula</div>
              <div class="detail-value">${datos.aula}</div>
            </div>
            ` : ''}
            ${datos.temas ? `
            <div class="detail-row">
              <div class="detail-label">📖 Temas</div>
              <div class="detail-value">${datos.temas}</div>
            </div>
            ` : ''}
          </div>
          <div style="text-align: center;">
            <a href="http://10.0.1.178:4200/ calendario" class="button">
              ✨ Ver mi calendario ✨
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
}

async function enviarCorreo(destinatario, asunto, html) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: destinatario,
      subject: asunto,
      html: html
    });
    console.log(`✅ Correo enviado a ${destinatario}`);
    return true;
  } catch (error) {
    console.error(`❌ Error enviando correo: ${error.message}`);
    return false;
  }
}

async function verificarYEnviarRecordatorios() {
  console.log(`[${new Date().toISOString()}] 🔍 Ejecutando ciclo de recordatorios...`);

  const { data: configs, error: configError } = await supabaseAdmin
    .from('configuracion_recordatorios')
    .select('usuario_id, recordatorio_24h, recordatorio_1h')
    .eq('recordatorios_activos', true);

  if (configError) {
    console.error('Error obteniendo configuraciones:', configError);
    return;
  }

  for (const config of configs) {
    const userId = config.usuario_id;

    const { data: userData, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('nombre_completo')
      .eq('id', userId)
      .single();

    if (userError || !userData) continue;

    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authError || !user?.email) continue;
    const email = user.email;

    // TAREAS
    if (config.recordatorio_24h || config.recordatorio_1h) {
      const { data: tareas, error: tareasError } = await supabaseAdmin
        .from('tareas')
        .select(`id, titulo, fecha_entrega, prioridad, materias (nombre, color)`)
        .eq('usuario_id', userId)
        .eq('estado', 'pendiente')
        .gte('fecha_entrega', new Date().toISOString());

      if (!tareasError && tareas) {
        for (const tarea of tareas) {
          const fechaEntrega = new Date(tarea.fecha_entrega);
          const ahora = new Date();
          const horasRestantes = (fechaEntrega - ahora) / (1000 * 60 * 60);

          // 24 horas
          if (config.recordatorio_24h && horasRestantes <= 24 && horasRestantes > 23) {
            const { data: yaEnviado } = await supabaseAdmin
              .from('recordatorios_historial')
              .select('id')
              .eq('usuario_id', userId)
              .eq('tipo_evento', 'tarea')
              .eq('evento_id', tarea.id)
              .eq('tipo_recordatorio', '24h')
              .single();

            if (!yaEnviado) {
              const html = generarPlantillaEmail('tarea', {
                nombreUsuario: userData.nombre_completo,
                titulo: tarea.titulo,
                materia: tarea.materias.nombre,
                fecha: tarea.fecha_entrega,
                prioridad: tarea.prioridad,
                color: tarea.materias.color
              }, horasRestantes);
              const enviado = await enviarCorreo(email, `⏰ "${tarea.titulo}" vence en 24h`, html);
              await supabaseAdmin.from('recordatorios_historial').insert({
                usuario_id: userId,
                tipo_evento: 'tarea',
                evento_id: tarea.id,
                tipo_recordatorio: '24h',
                status: enviado ? 'enviado' : 'fallido',
                email_enviado: email
              });
            }
          }

          // 1 hora
          if (config.recordatorio_1h && horasRestantes <= 1 && horasRestantes > 0) {
            const { data: yaEnviado } = await supabaseAdmin
              .from('recordatorios_historial')
              .select('id')
              .eq('usuario_id', userId)
              .eq('tipo_evento', 'tarea')
              .eq('evento_id', tarea.id)
              .eq('tipo_recordatorio', '1h')
              .single();

            if (!yaEnviado) {
              const html = generarPlantillaEmail('tarea', {
                nombreUsuario: userData.nombre_completo,
                titulo: tarea.titulo,
                materia: tarea.materias.nombre,
                fecha: tarea.fecha_entrega,
                prioridad: tarea.prioridad,
                color: tarea.materias.color
              }, horasRestantes);
              const enviado = await enviarCorreo(email, `⚠️ ¡URGENTE! "${tarea.titulo}" vence en 1 hora`, html);
              await supabaseAdmin.from('recordatorios_historial').insert({
                usuario_id: userId,
                tipo_evento: 'tarea',
                evento_id: tarea.id,
                tipo_recordatorio: '1h',
                status: enviado ? 'enviado' : 'fallido',
                email_enviado: email
              });
            }
          }

          // MEDIA HORA (30 minutos)
          if (horasRestantes <= 0.5 && horasRestantes > 0) {
            const { data: yaEnviado } = await supabaseAdmin
              .from('recordatorios_historial')
              .select('id')
              .eq('usuario_id', userId)
              .eq('tipo_evento', 'tarea')
              .eq('evento_id', tarea.id)
              .eq('tipo_recordatorio', '30min')
              .single();

            if (!yaEnviado) {
              const html = generarPlantillaEmail('tarea', {
                nombreUsuario: userData.nombre_completo,
                titulo: tarea.titulo,
                materia: tarea.materias.nombre,
                fecha: tarea.fecha_entrega,
                prioridad: tarea.prioridad,
                color: tarea.materias.color
              }, horasRestantes);
              const enviado = await enviarCorreo(email, `🔥 "${tarea.titulo}" vence en menos de 30 minutos`, html);
              await supabaseAdmin.from('recordatorios_historial').insert({
                usuario_id: userId,
                tipo_evento: 'tarea',
                evento_id: tarea.id,
                tipo_recordatorio: '30min',
                status: enviado ? 'enviado' : 'fallido',
                email_enviado: email
              });
            }
          }
        }
      }
    }

    // EXÁMENES
    if (config.recordatorio_24h || config.recordatorio_1h) {
      const { data: examenes, error: examenesError } = await supabaseAdmin
        .from('examenes')
        .select(`id, fecha_examen, temas, aula, materias (nombre, color)`)
        .eq('usuario_id', userId)
        .gte('fecha_examen', new Date().toISOString());

      if (!examenesError && examenes) {
        for (const examen of examenes) {
          const fechaExamen = new Date(examen.fecha_examen);
          const ahora = new Date();
          const horasRestantes = (fechaExamen - ahora) / (1000 * 60 * 60);

          if (config.recordatorio_24h && horasRestantes <= 24 && horasRestantes > 23) {
            const { data: yaEnviado } = await supabaseAdmin
              .from('recordatorios_historial')
              .select('id')
              .eq('usuario_id', userId)
              .eq('tipo_evento', 'examen')
              .eq('evento_id', examen.id)
              .eq('tipo_recordatorio', '24h')
              .single();

            if (!yaEnviado) {
              const html = generarPlantillaEmail('examen', {
                nombreUsuario: userData.nombre_completo,
                materia: examen.materias.nombre,
                fecha: examen.fecha_examen,
                aula: examen.aula,
                temas: examen.temas,
                color: examen.materias.color
              }, horasRestantes);
              const enviado = await enviarCorreo(email, `📚 Examen de ${examen.materias.nombre} en 24h`, html);
              await supabaseAdmin.from('recordatorios_historial').insert({
                usuario_id: userId,
                tipo_evento: 'examen',
                evento_id: examen.id,
                tipo_recordatorio: '24h',
                status: enviado ? 'enviado' : 'fallido',
                email_enviado: email
              });
            }
          }

          if (config.recordatorio_1h && horasRestantes <= 1 && horasRestantes > 0) {
            const { data: yaEnviado } = await supabaseAdmin
              .from('recordatorios_historial')
              .select('id')
              .eq('usuario_id', userId)
              .eq('tipo_evento', 'examen')
              .eq('evento_id', examen.id)
              .eq('tipo_recordatorio', '1h')
              .single();

            if (!yaEnviado) {
              const html = generarPlantillaEmail('examen', {
                nombreUsuario: userData.nombre_completo,
                materia: examen.materias.nombre,
                fecha: examen.fecha_examen,
                aula: examen.aula,
                temas: examen.temas,
                color: examen.materias.color
              }, horasRestantes);
              const enviado = await enviarCorreo(email, `⚠️ Examen de ${examen.materias.nombre} en 1 hora`, html);
              await supabaseAdmin.from('recordatorios_historial').insert({
                usuario_id: userId,
                tipo_evento: 'examen',
                evento_id: examen.id,
                tipo_recordatorio: '1h',
                status: enviado ? 'enviado' : 'fallido',
                email_enviado: email
              });
            }
          }

          // MEDIA HORA para exámenes
          if (horasRestantes <= 0.5 && horasRestantes > 0) {
            const { data: yaEnviado } = await supabaseAdmin
              .from('recordatorios_historial')
              .select('id')
              .eq('usuario_id', userId)
              .eq('tipo_evento', 'examen')
              .eq('evento_id', examen.id)
              .eq('tipo_recordatorio', '30min')
              .single();

            if (!yaEnviado) {
              const html = generarPlantillaEmail('examen', {
                nombreUsuario: userData.nombre_completo,
                materia: examen.materias.nombre,
                fecha: examen.fecha_examen,
                aula: examen.aula,
                temas: examen.temas,
                color: examen.materias.color
              }, horasRestantes);
              const enviado = await enviarCorreo(email, `🔥 Examen de ${examen.materias.nombre} en menos de 30 minutos`, html);
              await supabaseAdmin.from('recordatorios_historial').insert({
                usuario_id: userId,
                tipo_evento: 'examen',
                evento_id: examen.id,
                tipo_recordatorio: '30min',
                status: enviado ? 'enviado' : 'fallido',
                email_enviado: email
              });
            }
          }
        }
      }
    }
  }
}

// Ejecutar cada 30 minutos
setInterval(verificarYEnviarRecordatorios, 30 * 60 * 1000);
verificarYEnviarRecordatorios();

console.log('✅ Servicio de recordatorios ZENTHOR iniciado');
console.log('📧 Revisará cada 30 minutos y enviará correos 24h, 1h y 30min antes');