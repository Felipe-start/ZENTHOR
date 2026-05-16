const { google } = require('googleapis');
const supabase = require('../../config/supabase');

async function syncClassroom(userId, tokens) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials(tokens);
  const classroom = google.classroom({ version: 'v1', auth: oauth2Client });

  // Obtener cursos
  const coursesRes = await classroom.courses.list({ pageSize: 50 });
  const courses = coursesRes.data.courses || [];

  for (const course of courses) {
    // Guardar o actualizar materia en ZENTHOR
    const { data: materia } = await supabase.from('materias').upsert({
      usuario_id: userId,
      nombre: course.name,
      profesor: course.teacherGroupEmail || 'Desconocido',
      activo: course.courseState === 'ACTIVE',
      metadata: { google_id: course.id }
    }).select().single();

    // Obtener trabajos del curso
    const courseworkRes = await classroom.courses.courseWork.list({
      courseId: course.id,
      pageSize: 50
    });
    const works = courseworkRes.data.courseWork || [];

    for (const work of works) {
      if (work.dueDate) {
        const dueDate = new Date(work.dueDate.year, work.dueDate.month - 1, work.dueDate.day);
        await supabase.from('tareas').upsert({
          usuario_id: userId,
          materia_id: materia.id,
          titulo: work.title,
          descripcion: work.description,
          fecha_entrega: dueDate,
          estado: 'pendiente',
          prioridad: 'media',
          metadata: { google_id: work.id, source: 'classroom' }
        });
      }
    }

    // Descargar materiales adjuntos y subirlos a Supabase Storage + vectorizar
    // (llamar a n8n webhook para procesar)
  }
}

module.exports = { syncClassroom };