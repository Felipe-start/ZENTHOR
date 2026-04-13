const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    // Validar variables de entorno
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ ADVERTENCIA: Variables de correo no configuradas');
      console.warn('   Los recordatorios por email no funcionarán');
      return;
    }

    // Configurar transporter con Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    this.emailFrom = process.env.EMAIL_FROM || `"ZENTHOR" <${process.env.EMAIL_USER}>`;
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    
    console.log('✅ Servicio de email configurado con:', process.env.EMAIL_USER);
  }

  // Logo en Base64 (respaldo por si la URL falla)
  getLogoBase64() {
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjIwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM2NmYxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOGI1Y2Y2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHRleHQgeD0iNTAiIHk9IjcwIiBmb250LXNpemU9IjYwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlo8L3RleHQ+PC9zdmc+';
  }

  getLogoUrl() {
    // URL corregida sin espacios ni caracteres especiales
    return `${this.frontendUrl}/assets/images/LOGO.jpg`;
  }

  // Verificar si el email está configurado
  isEmailConfigured() {
    return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  }

  // Escapar HTML
  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Enviar recordatorio de tarea
  async enviarRecordatorioTarea(email, tarea, tipo) {
    if (!this.isEmailConfigured()) {
      console.log('📧 Email no configurado, recordatorio no enviado');
      return { success: false, error: 'Email no configurado' };
    }

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

    const LOGO_URL = this.getLogoUrl();
    const LOGO_BASE64 = this.getLogoBase64();

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
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
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
              <img src="${LOGO_URL}" alt="ZENTHOR" onerror="this.src='${LOGO_BASE64}'">
            </div>
            <h1>📋 Recordatorio de Tarea</h1>
            <p>ZENTHOR - Organiza tu vida académica</p>
          </div>
          <div class="content">
            <div class="alert-badge">
              ⏰ ¡Recordatorio de ${tiempoRestante}!
            </div>
            <div class="task-title">
              ${prioridadIconos[tarea.prioridad] || '📌'} ${this.escapeHtml(tarea.titulo)}
            </div>
            <div class="task-details">
              <div class="detail-row">
                <span class="detail-label">📚 Materia:</span>
                <span class="detail-value"><span class="materia-tag">${this.escapeHtml(tarea.materia_nombre)}</span></span>
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
                <span class="detail-value">${this.escapeHtml(tarea.descripcion.substring(0, 200))}${tarea.descripcion.length > 200 ? '...' : ''}</span>
              </div>
              ` : ''}
            </div>
            <div style="text-align: center;">
              <a href="${this.frontendUrl}/tareas" class="button">
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
      Materia: ${tarea.materia_nombre}
      Fecha de entrega: ${fechaFormateada}
      Hora: ${horaFormateada}
      Prioridad: ${tarea.prioridad?.toUpperCase() || 'MEDIA'}
      
      ${tarea.descripcion ? `Descripción: ${tarea.descripcion}` : ''}
      
      Visita ZENTHOR para más detalles:
      ${this.frontendUrl}/tareas
    `;

    try {
      const info = await this.transporter.sendMail({
        from: this.emailFrom,
        to: email,
        subject: `📋 ${prioridadIconos[tarea.prioridad] || '📌'} ${tarea.titulo} - ZENTHOR Enterprise`,
        text: text,
        html: html
      });
      console.log(`✅ Email enviado a ${email}`);
      return { success: true, info };
    } catch (error) {
      console.error('❌ Error enviando correo:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Enviar resumen semanal
  async enviarResumenSemanal(email, tareasProximas, tareasCompletadas) {
    if (!this.isEmailConfigured()) {
      return { success: false, error: 'Email no configurado' };
    }

    const LOGO_URL = this.getLogoUrl();
    const LOGO_BASE64 = this.getLogoBase64();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Resumen Semanal ZENTHOR</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
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
            width: 60px;
            height: 60px;
            border-radius: 16px;
            margin: 0 auto 16px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo img {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            object-fit: cover;
          }
          .header h1 {
            color: white;
            font-size: 24px;
            margin: 0;
          }
          .content {
            padding: 32px;
          }
          .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 20px 0;
          }
          .stat-card {
            background: #f9fafb;
            border-radius: 16px;
            padding: 16px;
            text-align: center;
          }
          .stat-number {
            font-size: 32px;
            font-weight: 700;
            color: #6366f1;
          }
          .task-list {
            margin: 20px 0;
          }
          .task-item {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .task-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="${LOGO_URL}" alt="ZENTHOR" onerror="this.src='${LOGO_BASE64}'">
            </div>
            <h1>📊 Tu Resumen Semanal</h1>
          </div>
          <div class="content">
            <p>¡Hola! Aquí está tu progreso de esta semana:</p>
            
            <div class="stats">
              <div class="stat-card">
                <div class="stat-number">${tareasCompletadas.length}</div>
                <div>✅ Tareas Completadas</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${tareasProximas.length}</div>
                <div>⏳ Tareas Pendientes</div>
              </div>
            </div>

            ${tareasProximas.length > 0 ? `
            <h3>📋 Tareas pendientes:</h3>
            <div class="task-list">
              ${tareasProximas.map(t => `
                <div class="task-item">
                  <div class="task-dot" style="background: ${t.prioridad === 'alta' ? '#ef4444' : t.prioridad === 'media' ? '#f59e0b' : '#10b981'}"></div>
                  <strong>${this.escapeHtml(t.titulo)}</strong>
                  <span style="margin-left: auto; font-size: 12px; color: #6b7280;">${new Date(t.fecha_entrega).toLocaleDateString()}</span>
                </div>
              `).join('')}
            </div>
            ` : '<p style="text-align: center; color: #10b981;">🎉 ¡No tienes tareas pendientes! Excelente trabajo.</p>'}

            <div style="text-align: center; margin-top: 30px;">
              <a href="${this.frontendUrl}/dashboard" class="button">
                📈 Ver mi progreso
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: this.emailFrom,
        to: email,
        subject: `📊 Tu resumen semanal - ZENTHOR Enterprise`,
        html: html
      });
      console.log(`✅ Resumen semanal enviado a ${email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error enviando resumen semanal:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();