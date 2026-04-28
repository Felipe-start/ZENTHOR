const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// ============================================
// ENDPOINT PARA N8N - Obtener token usando refresh_token
// ============================================
router.post('/token-usuario', async (req, res) => {
    try {
        const { usuario_id } = req.body;
        const masterKey = req.headers['x-master-key'];
        
        // Clave maestra desde variable de entorno
        const N8N_MASTER_KEY = process.env.N8N_MASTER_KEY || 'Z3n7h0r_M45t3r_K3y_2026';
        
        // Verificar que la petición viene de n8n
        if (masterKey !== N8N_MASTER_KEY) {
            console.log('❌ Intento no autorizado a token-usuario');
            return res.status(401).json({ 
                success: false, 
                error: 'No autorizado' 
            });
        }
        
        console.log(`🔑 Solicitando token para usuario: ${usuario_id}`);
        
        // Obtener el refresh_token del usuario desde la base de datos
        const { data: usuario, error: dbError } = await supabaseAdmin
            .from('usuarios_automatizacion')
            .select('refresh_token, email')
            .eq('usuario_id', usuario_id)
            .single();
        
        if (dbError || !usuario) {
            console.log(`❌ Usuario no encontrado: ${usuario_id}`);
            return res.status(404).json({ 
                success: false, 
                error: 'Usuario no encontrado' 
            });
        }
        
        if (!usuario.refresh_token) {
            console.log(`❌ Usuario sin refresh_token: ${usuario_id}`);
            return res.status(400).json({ 
                success: false, 
                error: 'Usuario no tiene refresh token configurado' 
            });
        }
        
        // Usar refresh_token para obtener un nuevo access_token
        const { data: session, error: tokenError } = await supabaseAdmin.auth
            .refreshSession({ refresh_token: usuario.refresh_token });
        
        if (tokenError || !session?.session) {
            console.log(`❌ Error refrescando token: ${tokenError?.message}`);
            return res.status(401).json({ 
                success: false, 
                error: 'Error al refrescar el token' 
            });
        }
        
        console.log(`✅ Token generado para: ${usuario.email}`);
        
        res.json({
            success: true,
            access_token: session.session.access_token,
            expires_in: 3600,
            email: usuario.email,
            usuario_id: usuario_id
        });
        
    } catch (error) {
        console.error('❌ Error en token-usuario:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// ENDPOINT PARA FRONTEND - Guardar refresh_token
// ============================================
router.post('/guardar-refresh-token', authMiddleware, async (req, res) => {
    try {
        const { refresh_token } = req.body;
        const usuario_id = req.userId;
        const email = req.user.email;
        
        if (!refresh_token) {
            return res.status(400).json({ 
                success: false, 
                error: 'refresh_token requerido' 
            });
        }
        
        console.log(`💾 Guardando refresh_token para usuario: ${email}`);
        
        // Upsert: inserta o actualiza si ya existe
        const { data, error } = await supabaseAdmin
            .from('usuarios_automatizacion')
            .upsert({
                usuario_id: usuario_id,
                email: email,
                refresh_token: refresh_token,
                recordatorios_activos: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'usuario_id'
            });
        
        if (error) {
            console.error('❌ Error guardando refresh_token:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        console.log(`✅ Refresh_token guardado para: ${email}`);
        
        res.json({
            success: true,
            message: 'Refresh token guardado correctamente'
        });
        
    } catch (error) {
        console.error('❌ Error en guardar-refresh-token:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// ENDPOINT PARA FRONTEND - Activar/desactivar recordatorios
// ============================================
router.post('/configurar', authMiddleware, async (req, res) => {
    try {
        const { activo, refresh_token } = req.body;
        const usuario_id = req.userId;
        const email = req.user.email;
        
        console.log(`⚙️ Configurando recordatorios: usuario=${email}, activo=${activo}`);
        
        const updateData = {
            recordatorios_activos: activo !== false,
            updated_at: new Date().toISOString()
        };
        
        // Si viene refresh_token, actualizarlo también
        if (refresh_token) {
            updateData.refresh_token = refresh_token;
        }
        
        const { data, error } = await supabaseAdmin
            .from('usuarios_automatizacion')
            .upsert({
                usuario_id: usuario_id,
                email: email,
                ...updateData
            }, {
                onConflict: 'usuario_id'
            });
        
        if (error) {
            console.error('❌ Error configurando recordatorios:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        console.log(`✅ Recordatorios ${activo !== false ? 'activados' : 'desactivados'} para: ${email}`);
        
        res.json({
            success: true,
            message: `Recordatorios ${activo !== false ? 'activados' : 'desactivados'} correctamente`
        });
        
    } catch (error) {
        console.error('❌ Error en configurar:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================
// ENDPOINT PARA FRONTEND - Obtener estado de recordatorios
// ============================================
router.get('/estado', authMiddleware, async (req, res) => {
    try {
        const usuario_id = req.userId;
        const email = req.user.email;
        
        const { data, error } = await supabaseAdmin
            .from('usuarios_automatizacion')
            .select('recordatorios_activos, email, refresh_token')
            .eq('usuario_id', usuario_id)
            .single();
        
        // Si no hay registro, devolver estado por defecto
        if (error && error.code === 'PGRST116') {
            return res.json({
                success: true,
                data: {
                    activos: false,
                    email: email,
                    configurado: false
                }
            });
        }
        
        if (error) {
            console.error('❌ Error obteniendo estado:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        res.json({
            success: true,
            data: {
                activos: data?.recordatorios_activos || false,
                email: data?.email || email,
                configurado: !!data
            }
        });
        
    } catch (error) {
        console.error('❌ Error en estado:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});
// ============================================
// ENDPOINT PARA ACTUALIZAR REFRESH TOKEN (FRONTEND)
// ============================================
router.post('/actualizar-refresh-token', authMiddleware, async (req, res) => {
    try {
        const { refresh_token } = req.body;
        const usuario_id = req.userId;
        const email = req.user.email;
        
        if (!refresh_token) {
            return res.status(400).json({ 
                success: false, 
                error: 'refresh_token requerido' 
            });
        }
        
        console.log(`🔄 Actualizando refresh_token para: ${email}`);
        
        const { error } = await supabaseAdmin
            .from('usuarios_automatizacion')
            .upsert({
                usuario_id: usuario_id,
                email: email,
                refresh_token: refresh_token,
                recordatorios_activos: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'usuario_id'
            });
        
        if (error) throw error;
        
        console.log(`✅ Refresh token actualizado para: ${email}`);
        res.json({ success: true, message: 'Refresh token actualizado' });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// ENDPOINT PARA N8N - Health check
// ============================================
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'recordatorios',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;