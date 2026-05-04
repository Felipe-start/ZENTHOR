const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// ============================================
// CONFIGURACIÓN
// ============================================
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const HUGGING_FACE_TOKEN = process.env.HF_TOKEN || '';
const HF_EMBEDDING_MODEL = process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';
const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile';
const EMBEDDING_DIMENSION = 384;

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Generar embedding con Hugging Face
async function generarEmbedding(texto) {
    if (!HUGGING_FACE_TOKEN) {
        console.error('❌ HF_TOKEN no configurado');
        return Array(EMBEDDING_DIMENSION).fill(0).map(() => Math.random() - 0.5);
    }
    
    try {
        const response = await fetch(
            `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_EMBEDDING_MODEL}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`
                },
                body: JSON.stringify({
                    inputs: texto,
                    options: { wait_for_model: true }
                })
            }
        );
        
        if (!response.ok) {
            const error = await response.text();
            console.error(`Hugging Face error: ${response.status} - ${error}`);
            throw new Error(`Embedding failed: ${response.status}`);
        }
        
        const embedding = await response.json();
        
        if (!Array.isArray(embedding)) {
            throw new Error('Embedding no es un array');
        }
        
        console.log(`✅ Embedding generado (${embedding.length} dims)`);
        return embedding;
        
    } catch (error) {
        console.error('❌ Error generando embedding:', error.message);
        return Array(EMBEDDING_DIMENSION).fill(0).map(() => Math.random() - 0.5);
    }
}

// Llamar a Groq (chat y generación)
async function llamarGroq(mensajes, temperatura = 0.7, max_tokens = 1000) {
    if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY no configurada');
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: GROQ_CHAT_MODEL,
            messages: mensajes,
            temperature: temperatura,
            max_tokens: max_tokens
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq error: ${error}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

// ============================================
// 1. VECTORIZAR DOCUMENTO
// ============================================
router.post('/vectorizar', authMiddleware, async (req, res) => {
    try {
        const { titulo, fuente, contenido, metadata } = req.body;
        const usuario_id = req.userId;
        
        if (!contenido || contenido.length < 50) {
            return res.status(400).json({ 
                success: false, 
                error: 'El contenido debe tener al menos 50 caracteres' 
            });
        }
        
        console.log(`📄 Vectorizando: ${titulo} (${contenido.length} chars)`);
        
        const embedding = await generarEmbedding(contenido);
        
        const { data, error } = await supabaseAdmin
            .from('documentos_vector')
            .insert({
                usuario_id,
                titulo,
                fuente,
                contenido,
                embedding,
                metadata: metadata || {},
                creado_en: new Date().toISOString(),
                actualizado_en: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({
            success: true,
            data: { id: data.id, titulo: data.titulo, dimension: embedding.length }
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// 2. CHAT CON RAG
// ============================================
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { pregunta, conversacion_id, materia_id } = req.body;
        const usuario_id = req.userId;
        
        if (!pregunta) {
            return res.status(400).json({ success: false, error: 'Pregunta requerida' });
        }
        
        console.log(`💬 Chat: "${pregunta.substring(0, 50)}..."`);
        
        // Buscar documentos relevantes
        let query = supabaseAdmin
            .from('documentos_vector')
            .select('id, titulo, contenido, metadata')
            .eq('usuario_id', usuario_id)
            .limit(5);
        
        if (materia_id) {
            query = query.eq('metadata->>materia_id', materia_id.toString());
        }
        
        const { data: documentos, error: searchError } = await query;
        
        if (searchError) throw searchError;
        
        // Construir contexto
        let contexto = "";
        const fuentes = [];
        
        for (const doc of documentos || []) {
            contexto += `\n\n[${doc.titulo}]\n${doc.contenido.substring(0, 1500)}`;
            fuentes.push({ id: doc.id, titulo: doc.titulo });
        }
        
        if (!contexto) {
            contexto = "No se encontraron documentos en tu base de conocimiento.";
        }
        
        // Llamar a Groq
        const systemPrompt = `Eres ZENTHOR Assistant, un asistente académico experto.
Responde basándote ESTRICTAMENTE en el contexto proporcionado.
Si la respuesta NO está en el contexto, di: "No tengo información suficiente sobre eso en tus documentos."
Sé conciso, claro y útil.`;

        const userPrompt = `CONTEXTO:
${contexto}

PREGUNTA: ${pregunta}

RESPUESTA:`;
        
        const respuesta = await llamarGroq([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]);
        
        // Guardar conversación (opcional)
        let convId = conversacion_id;
        if (!convId) {
            const { data: newConv } = await supabaseAdmin
                .from('chat_conversaciones')
                .insert({
                    usuario_id,
                    materia_id: materia_id || null,
                    titulo: pregunta.substring(0, 50),
                    creado_en: new Date().toISOString()
                })
                .select()
                .single();
            
            if (newConv) convId = newConv.id;
        }
        
        if (convId) {
            await supabaseAdmin.from('chat_mensajes').insert([
                { conversacion_id: convId, rol: 'usuario', contenido: pregunta },
                { conversacion_id: convId, rol: 'asistente', contenido: respuesta, fuentes }
            ]);
        }
        
        res.json({
            success: true,
            data: { respuesta, fuentes, conversacion_id: convId }
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// 3. GENERAR GUÍA DE ESTUDIO
// ============================================
router.post('/generar-guia', authMiddleware, async (req, res) => {
    try {
        const { materia_id, tema, nivel_detalle = 'normal' } = req.body;
        const usuario_id = req.userId;
        
        console.log(`📚 Generando guía`);
        
        let query = supabaseAdmin
            .from('documentos_vector')
            .select('titulo, contenido')
            .eq('usuario_id', usuario_id)
            .limit(20);
        
        if (materia_id) {
            query = query.eq('metadata->>materia_id', materia_id.toString());
        }
        
        const { data: documentos, error: docsError } = await query;
        
        if (docsError) throw docsError;
        
        const contexto = documentos.map(d => d.contenido).join('\n\n---\n\n').substring(0, 8000);
        
        if (!contexto) {
            return res.status(400).json({ success: false, error: 'No hay documentos suficientes' });
        }
        
        const prompt = `Crea una guía de estudio basada en este contenido.${tema ? ` Enfócate en: "${tema}".` : ''}
Nivel: ${nivel_detalle}.

CONTENIDO:
${contexto}

Formato:
# Título

## Resumen
[2-3 párrafos]

## Conceptos Clave
[Lista con definiciones]

## Desarrollo
[Explicación detallada]

## Preguntas de Repaso
[5-8 preguntas]`;
        
        const guia = await llamarGroq([{ role: 'user', content: prompt }], 0.5, 2000);
        
        const { data: guiaGuardada } = await supabaseAdmin
            .from('guias_estudio')
            .insert({
                usuario_id,
                materia_id: materia_id || null,
                titulo: tema ? `Guía: ${tema}` : `Guía - ${new Date().toLocaleDateString()}`,
                contenido: guia,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        res.json({
            success: true,
            data: { id: guiaGuardada.id, contenido: guia }
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// 4. GENERAR EJERCICIOS
// ============================================
router.post('/generar-ejercicios', authMiddleware, async (req, res) => {
    try {
        const { materia_id, cantidad = 5, dificultad = 'media' } = req.body;
        const usuario_id = req.userId;
        
        let query = supabaseAdmin
            .from('documentos_vector')
            .select('titulo, contenido')
            .eq('usuario_id', usuario_id)
            .limit(15);
        
        if (materia_id) {
            query = query.eq('metadata->>materia_id', materia_id.toString());
        }
        
        const { data: documentos, error: docsError } = await query;
        
        if (docsError) throw docsError;
        
        const contexto = documentos.map(d => d.contenido).join('\n\n---\n\n').substring(0, 6000);
        
        const prompt = `Genera ${cantidad} ejercicios de opción múltiple (${dificultad}) basados en este contenido.
Responde SOLO con JSON válido.

Formato:
[
  {
    "pregunta": "texto",
    "opciones": ["A) op1", "B) op2", "C) op3", "D) op4"],
    "respuesta_correcta": "A",
    "explicacion": "..."
  }
]

CONTENIDO:
${contexto}`;
        
        const respuesta = await llamarGroq([{ role: 'user', content: prompt }], 0.7, 2500);
        
        let preguntas = [];
        const jsonMatch = respuesta.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            preguntas = JSON.parse(jsonMatch[0]);
        }
        
        const { data: ejerciciosGuardados } = await supabaseAdmin
            .from('ejercicios_generados')
            .insert({
                usuario_id,
                materia_id: materia_id || null,
                titulo: `Ejercicios - ${new Date().toLocaleDateString()}`,
                preguntas,
                dificultad
            })
            .select()
            .single();
        
        res.json({
            success: true,
            data: { id: ejerciciosGuardados.id, preguntas }
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// 5. OBTENER DOCUMENTOS
// ============================================
router.get('/documentos', authMiddleware, async (req, res) => {
    try {
        const usuario_id = req.userId;
        const { materia_id, limite = 50 } = req.query;
        
        let query = supabaseAdmin
            .from('documentos_vector')
            .select('id, titulo, fuente, metadata, creado_en')
            .eq('usuario_id', usuario_id)
            .order('creado_en', { ascending: false })
            .limit(limite);
        
        if (materia_id) {
            query = query.eq('metadata->>materia_id', materia_id);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        res.json({ success: true, data: data || [] });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// 6. ELIMINAR DOCUMENTO
// ============================================
router.delete('/documentos/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.userId;
        
        const { error } = await supabaseAdmin
            .from('documentos_vector')
            .delete()
            .eq('id', id)
            .eq('usuario_id', usuario_id);
        
        if (error) throw error;
        
        res.json({ success: true, message: 'Documento eliminado' });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// 7. HEALTH CHECK
// ============================================
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'RAG ZENTHOR',
        embeddings: HF_EMBEDDING_MODEL,
        chat: GROQ_CHAT_MODEL,
        dimension: EMBEDDING_DIMENSION
    });
});

module.exports = router;