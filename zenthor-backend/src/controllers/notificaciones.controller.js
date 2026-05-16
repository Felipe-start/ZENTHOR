const { sendEmail } = require('../config/email');
const { enviarWhatsApp } = require('../services/whatsapp.service');
const { supabaseAdmin } = require('../config/supabase');

const enviarRecordatorio = async (req, res) => {
  const { tipo, evento_id } = req.body;

  try {
    // Obtener configuración del usuario
    const { data: config } = await supabaseAdmin
      .from('configuracion_recordatorios')
      .select('*')
      .eq('usuario_id', req.user.id)
      .single();

    // Obtener evento (tarea o examen)
    let evento;
    if (tipo === 'tarea') {
      const { data } = await supabaseAdmin
        .from('tareas')
        .select('*, materias(nombre)')
        .eq('id', evento_id)
        .single();
      evento = data;
    } else {
      const { data } = await supabaseAdmin
        .from('examenes')
        .select('*, materias(nombre)')
        .eq('id', evento_id)
        .single();
      evento = data;
    }

    const mensaje = `
      📚 ZENTHOR Recordatorio
      
      ${tipo === 'tarea' ? '📝 Tarea' : '📅 Examen'}: ${evento.titulo}
      Materia: ${evento.materias?.nombre}
      Fecha: ${new Date(evento.fecha_entrega || evento.fecha_examen).toLocaleString()}
      
      No olvides prepararte con tiempo. ¡Éxito! 🎯
    `;

    // Enviar email si está activo
    if (config?.email_activo !== false) {
      await sendEmail(
        req.user.email,
        `📚 Recordatorio: ${evento.titulo}`,
        `<h2>ZENTHOR Recordatorio</h2><p>${mensaje.replace(/\n/g, '<br>')}</p>`
      );
    }

    // Enviar WhatsApp si está activo
    if (config?.whatsapp_activo && config?.telefono) {
      await enviarWhatsApp(config.telefono, mensaje);
    }

    // Registrar en historial
    await supabaseAdmin
      .from('recordatorios_historial')
      .insert({
        usuario_id: req.user.id,
        tipo_evento: tipo,
        evento_id: evento_id,
        tipo_recordatorio: 'manual',
        status: 'enviado',
        email_enviado: req.user.email
      });

    res.json({ success: true, mensaje: 'Recordatorio enviado' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarConfiguracionNotificaciones = async (req, res) => {
  const { recordatorios_activos, recordatorio_24h, recordatorio_1h, whatsapp_activo, telefono } = req.body;

  try {
    await supabaseAdmin
      .from('configuracion_recordatorios')
      .upsert({
        usuario_id: req.user.id,
        recordatorios_activos,
        recordatorio_24h,
        recordatorio_1h,
        whatsapp_activo,
        telefono,
        updated_at: new Date()
      });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { enviarRecordatorio, actualizarConfiguracionNotificaciones };