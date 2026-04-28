const express = require('express');
const router = express.Router();
const { supabaseAdmin, getSupabaseClient } = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// ============================================
// ENDPOINT PARA N8N - Obtener token de usuario
// ============================================
// Este endpoint es llamado por n8n para obtener un token válido
// de cualquier usuario (usando una clave maestra)
router.post('/token-usuario', async (req, res) => {
    try {
        const { usuario_id } = req.body;
        const masterKey = req.headers['x-master-key'];
        
        // Clave maestra para autenticar a n8n (debe estar en .env)
        const N8N_MASTER_KEY = process.env.N8N_MASTER_KEY || 'Z3n7h0r_M45t3r_K3y_2026';
        
        // Verificar que la petición viene de n8n
        if (masterKey !== N8N_MASTER_KEY) {
            console.log('❌ Intento no autorizado a token-usuario');
            return res.status(401).json({ 
                success: false, 
                error: 'No autorizado - Master key inválida' 
            });
        }
        
        console.log(`🔑 Solicitando token para usuario: ${usuario_id}`);
        
        // Obtener el refresh token del usuario desde la base de datos
        const { data: usuario, error: dbError } = await supabaseAdmin
            .from('usuarios_recordatorios')
            .select('refresh_token, email')
            .eq('usuario_id', usuario_id)
            .single();
        
        if (dbError || !usuario) {
            console.log(`❌ Usuario no encontrado: ${usuario_id}`);
            return res.status(404).json({ 
                success: false, 
                error: 'Usuario no encontrado en la tabla de recordatorios' 
            });
        }
        
        if (!usuario.refresh_token) {
            console.log(`❌ Usuario sin refresh_token: ${usuario_id}`);
            return res.status(400).json({ 
                success: false, 
                error: 'Usuario no tiene refresh token configurado' 
            });
        }
        
        // Usar refresh token para obtener un nuevo access token
        const { data: session, error: tokenError } = await supabaseAdmin.auth
            .refreshSession({ refresh_token: usuario.refresh_token });
        
        if (tokenError || !session?.session) {
            console.log(`❌ Error refrescando token: ${tokenError?.message}`);
            return res.status(401).json({ 
                success: false, 
                error: 'Error al refrescar el token de autenticación' 
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
// ENDPOINT PARA USUARIOS - Configurar recordatorios
// ============================================
// El usuario puede activar/desactivar sus recordatorios
router.post('/configurar', authMiddleware, async (req, res) => {
    try {
        const { activo, refresh_token } = req.body;
        const usuario_id = req.userId;
        
        console.log(`⚙️ Configurando recordatorios para usuario: ${usuario_id}, activo: ${activo}`);
        
        // Verificar si ya existe un registro
        const { data: existente } = await supabaseAdmin
            .from('usuarios_recordatorios')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();
        
        let result;
        
        if (existente) {
            // Actualizar existente
            result = await supabaseAdmin
                .from('usuarios_recordatorios')
                .update({
                    recordatorios_activos: activo !== false,
                    updated_at: new Date().toISOString()
                })
                .eq('usuario_id', usuario_id);
        } else {
            // Crear nuevo registro
            result = await supabaseAdmin
                .from('usuarios_recordatorios')
                .insert({
                    usuario_id: usuario_id,
                    email: req.user.email,
                    refresh_token: refresh_token || null,
                    recordatorios_activos: activo !== false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
        }
        
        if (result.error) {
            console.error('❌ Error guardando configuración:', result.error);
            return res.status(500).json({ 
                success: false, 
                error: result.error.message 
            });
        }
        
        console.log(`✅ Configuración guardada para: ${req.user.email}`);
        
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
// ENDPOINT PARA USUARIOS - Obtener estado de recordatorios
// ============================================
router.get('/estado', authMiddleware, async (req, res) => {
    try {
        const usuario_id = req.userId;
        
        const { data, error } = await supabaseAdmin
            .from('usuarios_recordatorios')
            .select('recordatorios_activos, email, created_at, updated_at')
            .eq('usuario_id', usuario_id)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no encontrado
            return res.status(500).json({ success: false, error: error.message });
        }
        
        res.json({
            success: true,
            data: {
                activos: data?.recordatorios_activos ?? false,
                email: data?.email || req.user.email,
                configurado: !!data
            }
        });
        
    } catch (error) {
        console.error('❌ Error en estado:', error);
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