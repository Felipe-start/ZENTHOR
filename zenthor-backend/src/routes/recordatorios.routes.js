const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// ============================================
// ENDPOINT PARA N8N - Obtener token usando email/password
// ============================================
router.post('/token-usuario', async (req, res) => {
    try {
        const { usuario_id } = req.body;
        const masterKey = req.headers['x-master-key'];
        const N8N_MASTER_KEY = process.env.N8N_MASTER_KEY || 'Z3n7h0r_M45t3r_K3y_2026';
        
        if (masterKey !== N8N_MASTER_KEY) {
            return res.status(401).json({ success: false, error: 'No autorizado' });
        }
        
        console.log(`🔑 Buscando usuario: ${usuario_id}`);
        
        // Buscar el usuario en la tabla
        const { data: usuario, error: dbError } = await supabaseAdmin
            .from('usuarios_automatizacion')
            .select('email, password')
            .eq('usuario_id', usuario_id)
            .single();
        
        if (dbError || !usuario) {
            console.log(`❌ Usuario no encontrado: ${usuario_id}`);
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }
        
        if (!usuario.email || !usuario.password) {
            console.log(`❌ Usuario sin credenciales: ${usuario_id}`);
            return res.status(400).json({ 
                success: false, 
                error: 'Usuario no tiene credenciales configuradas' 
            });
        }
        
        console.log(`🔐 Autenticando a: ${usuario.email}`);
        
        // Usar email y password para obtener token directamente
        const { data: auth, error: authError } = await supabaseAdmin.auth.signInWithPassword({
            email: usuario.email,
            password: usuario.password
        });
        
        if (authError || !auth?.session) {
            console.log(`❌ Error autenticando: ${authError?.message}`);
            return res.status(401).json({ 
                success: false, 
                error: 'Credenciales inválidas' 
            });
        }
        
        console.log(`✅ Token generado para: ${usuario.email}`);
        
        res.json({
            success: true,
            access_token: auth.session.access_token,
            refresh_token: auth.session.refresh_token,
            expires_in: 3600,
            email: usuario.email,
            usuario_id: usuario_id
        });
        
    } catch (error) {
        console.error('❌ Error en token-usuario:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// ENDPOINT PARA FRONTEND - Guardar credenciales
// ============================================
router.post('/guardar-credenciales', authMiddleware, async (req, res) => {
    try {
        const { password } = req.body;
        const usuario_id = req.userId;
        const email = req.user.email;
        
        if (!password) {
            return res.status(400).json({ 
                success: false, 
                error: 'password requerido' 
            });
        }
        
        console.log(`💾 Guardando credenciales para: ${email}`);
        
        const { error } = await supabaseAdmin
            .from('usuarios_automatizacion')
            .upsert({
                usuario_id: usuario_id,
                email: email,
                password: password,
                recordatorios_activos: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'usuario_id'
            });
        
        if (error) throw error;
        
        console.log(`✅ Credenciales guardadas para: ${email}`);
        res.json({ success: true, message: 'Credenciales guardadas correctamente' });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// ENDPOINT PARA FRONTEND - Activar/desactivar recordatorios
// ============================================
router.post('/configurar', authMiddleware, async (req, res) => {
    try {
        const { activo } = req.body;
        const usuario_id = req.userId;
        const email = req.user.email;
        
        console.log(`⚙️ Configurando recordatorios: usuario=${email}, activo=${activo}`);
        
        const { error } = await supabaseAdmin
            .from('usuarios_automatizacion')
            .upsert({
                usuario_id: usuario_id,
                email: email,
                recordatorios_activos: activo !== false,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'usuario_id'
            });
        
        if (error) throw error;
        
        console.log(`✅ Recordatorios ${activo !== false ? 'activados' : 'desactivados'} para: ${email}`);
        
        res.json({
            success: true,
            message: `Recordatorios ${activo !== false ? 'activados' : 'desactivados'} correctamente`
        });
        
    } catch (error) {
        console.error('❌ Error en configurar:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// ENDPOINT PARA FRONTEND - Obtener estado
// ============================================
router.get('/estado', authMiddleware, async (req, res) => {
    try {
        const usuario_id = req.userId;
        const email = req.user.email;
        
        const { data, error } = await supabaseAdmin
            .from('usuarios_automatizacion')
            .select('recordatorios_activos, email')
            .eq('usuario_id', usuario_id)
            .single();
        
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
        
        if (error) throw error;
        
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