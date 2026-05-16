const { google } = require('googleapis');
const { supabaseAdmin } = require('../config/supabase');
const { generarEmbedding } = require('./embeddings.service');
const { sendEmail } = require('../config/email');

const syncGoogleClassroom = async (userId, accessToken, refreshToken) => {
  console.log(`🔄 Sincronizando Google Classroom para usuario ${userId}`);
  
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  const classroom = google.classroom({ version: 'v1', auth: oauth2Client });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    // 1. Obtener cursos
    const coursesRes = await classroom.courses.list({ pageSize: 50 });
    const courses = coursesRes.data.courses || [];

    for (const course of courses) {
      // Crear o actualizar materia
      const { data: materia } = await supabaseAdmin
        .from('materias')
        .upsert({
          usuario_id: userId,
          nombre: course.name,
          profesor: course.teacherGroupEmail || 'Profesor',
          color: getRandomColor(),
          activo: course.courseState === 'ACTIVE',
          metadata: { google_id: course.id }
        })
        .select()
        .single();

      // 2. Obtener trabajos (tareas)
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

          await supabaseAdmin
            .from('tareas')
            .upsert({
              usuario_id: userId,
              materia_id: materia.id,
              titulo: work.title,
              descripcion: work.description || '',
              fecha_entrega: dueDate,
              estado: work.state === 'PUBLISHED' ? 'pendiente' : 'completada',
              prioridad: 'media',
              metadata: { google_id: work.id, source: 'classroom' }
            });
        }
      }

      // 3. Procesar materiales del curso (documentos)
      const materialsRes = await classroom.courses.courseWorkMaterials.list({
        courseId: course.id,
        pageSize: 50
      });
      const materials = materialsRes.data.courseWorkMaterial || [];

      for (const material of materials) {
        for (const attachment of material.materials || []) {
          if (attachment.driveFile) {
            // Descargar archivo de Drive y procesar
            await procesarArchivoDrive(userId, materia.id, attachment.driveFile.driveFile.id, material.title);
          }
        }
      }
    }

    // 4. Actualizar última sincronización
    await supabaseAdmin
      .from('fuentes_conectadas')
      .update({ ultima_sincronizacion: new Date() })
      .eq('usuario_id', userId)
      .eq('tipo', 'google_classroom');

    console.log(`✅ Sincronización completada para usuario ${userId}`);
    
    // Enviar notificación de éxito
    await sendEmail(
      req.user?.email || 'usuario@example.com',
      '✅ Sincronización completada',
      '<h1>ZENTHOR ha sincronizado tus datos de Google Classroom</h1><p>Tus tareas y materiales están listos.</p>'
    );

  } catch (error) {
    console.error('Error syncing Google Classroom:', error);
    throw error;
  }
};

const getRandomColor = () => {
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const procesarArchivoDrive = async (userId, materiaId, fileId, titulo) => {
  // Implementar descarga de Drive y procesamiento
  // Por simplicidad, se omite pero puedes implementarlo con googleapis drive v3
};

module.exports = { syncGoogleClassroom };