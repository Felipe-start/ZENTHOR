const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// 🔐 CONFIGURA ESTO
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 📧 CONFIG CORREO (GMAIL)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 🧠 FUNCIÓN PRINCIPAL
const enviarRecordatorios = async () => {
  try {
    const ahora = new Date();
    const en24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    console.log("⏰ Buscando eventos próximos...");

    // 📌 TAREAS
    const { data: tareas, error: errorTareas } = await supabase
      .from('tareas')
      .select('*')
      .gte('fecha_entrega', ahora.toISOString())
      .lte('fecha_entrega', en24h.toISOString());

    if (errorTareas) throw errorTareas;

    for (let tarea of tareas || []) {
      await procesarEvento(tarea, 'tarea');
    }

    // 📌 EXÁMENES
    const { data: examenes, error: errorExamenes } = await supabase
      .from('examenes')
      .select('*')
      .gte('fecha_examen', ahora.toISOString())
      .lte('fecha_examen', en24h.toISOString());

    if (errorExamenes) throw errorExamenes;

    for (let examen of examenes || []) {
      await procesarEvento(examen, 'examen');
    }

  } catch (error) {
    console.error("❌ Error en recordatorios:", error);
  }
};

// 🔁 PROCESAR EVENTO
const procesarEvento = async (evento, tipo) => {
  try {

    const { data: historial } = await supabase
      .from('recordatorios_historial')
      .select('*')
      .eq('evento_id', evento.id)
      .eq('tipo_evento', tipo)
      .eq('tipo_recordatorio', '24h');

    if (historial && historial.length > 0) {
      console.log(`⏭ Ya enviado (${tipo} ${evento.id})`);
      return;
    }

    // 📧 Obtener email
    const email = await obtenerEmailUsuario(evento.usuario_id);

    if (!email) {
      console.log("⚠️ No se encontró email");
      return;
    }

    // 📤 Enviar correo
    await enviarCorreo(evento, tipo, email);

    // 💾 Guardar historial
    await supabase.from('recordatorios_historial').insert({
      usuario_id: evento.usuario_id,
      tipo_evento: tipo,
      evento_id: evento.id,
      tipo_recordatorio: '24h',
      email_enviado: email,
      status: 'enviado'
    });

    console.log(`✅ Recordatorio enviado (${tipo})`);

  } catch (error) {
    console.error("❌ Error procesando evento:", error);
  }
};

// 📧 ENVIAR CORREO
const enviarCorreo = async (evento, tipo, email) => {
  const mensaje =
    tipo === 'tarea'
      ? `📚 Tienes una tarea próxima:\n\n${evento.titulo}\nEntrega: ${evento.fecha_entrega}`
      : `📝 Tienes un examen próximo\nFecha: ${evento.fecha_examen}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '📌 Recordatorio Académico - ZENTHOR',
    text: mensaje
  });
};

// 🔐 OBTENER EMAIL
const obtenerEmailUsuario = async (userId) => {
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error) {
    console.error("Error obteniendo email:", error);
    return null;
  }

  return data.user.email;
};

// 🔥 EXPORT CORRECTO
module.exports = { enviarRecordatorios };