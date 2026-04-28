const { supabaseAdmin } = require('../config/supabase');
const emailService = require('./email.service');

class RecordatoriosService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  isEmailConfigured() {
    return emailService.isEmailConfigured ? emailService.isEmailConfigured() : false;
  }

  iniciar() {
    if (this.intervalId || this.isRunning) {
      console.log('⚠️ Servicio de recordatorios ya está corriendo');
      return;
    }
    
    if (!emailService.isEmailConfigured()) {
      console.log('⚠️ Servicio de recordatorios iniciado en modo simulación');
    }
    
    this.intervalId = setInterval(() => {
      this.verificarYEnviarRecordatorios();
    }, 60 * 60 * 1000);
    
    this.isRunning = true;
    console.log('✅ Servicio de recordatorios iniciado');
    
    setTimeout(() => {
      this.verificarYEnviarRecordatorios();
    }, 5000);
  }

  detener() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('🛑 Servicio de recordatorios detenido');
    }
  }

  async verificarYEnviarRecordatorios() {
    try {
      console.log('🔍 Verificando recordatorios...', new Date().toISOString());
      
      const ahora = new Date();

      // Obtener tareas con materia
      const { data: tareas, error } = await supabaseAdmin
        .from('tareas')
        .select(`
          *,
          materias (
            nombre,
            color
          )
        `)
        .eq('estado', 'pendiente')
        .gte('fecha_entrega', ahora.toISOString());

      if (error) {
        console.error('Error obteniendo tareas:', error);
        return;
      }

      console.log(`📊 Revisando ${tareas?.length || 0} tareas pendientes`);

      for (const tarea of tareas || []) {
        // Obtener el email del usuario desde auth.users
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(tarea.usuario_id);
        
        if (authError || !authUser?.user?.email) {
          console.error(`Error obteniendo email para usuario ${tarea.usuario_id}:`, authError);
          continue;
        }

        // Obtener nombre del usuario desde tabla usuarios
        const { data: usuario, error: userError } = await supabaseAdmin
          .from('usuarios')
          .select('nombre_completo')
          .eq('id', tarea.usuario_id)
          .single();

        const email = authUser.user.email;
        const nombreCompleto = usuario?.nombre_completo || 'Usuario';

        const fechaEntrega = new Date(tarea.fecha_entrega);
        const tiempoRestante = fechaEntrega - ahora;
        const horasRestantes = tiempoRestante / (1000 * 60 * 60);

        // Verificar recordatorio de 24 horas
        if (horasRestantes <= 24.5 && horasRestantes >= 23.5) {
          await this.enviarRecordatorioSiNoEnviado(tarea, { email, nombre_completo: nombreCompleto }, '24h');
        }
        
        // Verificar recordatorio de 1 hora
        if (horasRestantes <= 1.5 && horasRestantes >= 0.5) {
          await this.enviarRecordatorioSiNoEnviado(tarea, { email, nombre_completo: nombreCompleto }, '1h');
        }
      }
      
      console.log('✅ Verificación de recordatorios completada');
    } catch (error) {
      console.error('Error verificando recordatorios:', error);
    }
  }

  async enviarRecordatorioSiNoEnviado(tarea, usuario, tipo) {
    try {
      // Verificar si ya se envió este recordatorio
      const { data: historial, error } = await supabaseAdmin
        .from('recordatorios_historial')
        .select('*')
        .eq('evento_id', tarea.id)
        .eq('tipo_evento', 'tarea')
        .eq('tipo_recordatorio', tipo)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error verificando historial:', error);
        return;
      }
      
      if (historial) {
        console.log(`⏭️ Recordatorio ${tipo} ya enviado para tarea: ${tarea.titulo}`);
        return;
      }

      const tareaConMateria = {
        ...tarea,
        materia_nombre: tarea.materias?.nombre || 'Sin materia'
      };

      const resultado = await emailService.enviarRecordatorioTarea(
        usuario.email,
        tareaConMateria,
        tipo
      );

      // Registrar en historial
      await supabaseAdmin
        .from('recordatorios_historial')
        .insert({
          usuario_id: tarea.usuario_id,
          tipo_evento: 'tarea',
          evento_id: tarea.id,
          tipo_recordatorio: tipo,
          status: resultado.success ? 'enviado' : 'fallido',
          email_enviado: usuario.email,
          error_message: resultado.error || null
        });

      if (resultado.success) {
        console.log(`📧 Recordatorio ${tipo} enviado para: ${tarea.titulo} -> ${usuario.email}`);
      } else {
        console.log(`❌ Falló envío para: ${tarea.titulo} - ${resultado.error}`);
      }
    } catch (error) {
      console.error(`Error enviando recordatorio para tarea ${tarea.id}:`, error);
    }
  }
}


module.exports = new RecordatoriosService();
