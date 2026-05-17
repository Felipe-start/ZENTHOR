const axios = require('axios');
const { getSupabaseClient } = require('../config/supabase');
const { generarEmbedding } = require('../services/embeddings.service');

// Función de similitud coseno
const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

// Chat RAG
const chat = async (req, res) => {
  const { pregunta, conversacion_id } = req.body;

  if (!pregunta) {
    return res.status(400).json({ success: false, error: 'La pregunta es requerida' });
  }

  try {
    console.log(`📝 Pregunta recibida: ${pregunta.substring(0, 50)}...`);
    
    const supabase = getSupabaseClient(req.headers.authorization.split(' ')[1]);
    
    // 1. Obtener documentos del usuario
    const { data: documentos, error: docError } = await supabase
      .from('documentos_vector')
      .select('id, titulo, contenido, fuente, embedding')
      .eq('usuario_id', req.userId);

    if (docError) {
      console.error('Error obteniendo documentos:', docError);
      throw docError;
    }
    
    console.log(`📚 Documentos encontrados: ${documentos?.length || 0}`);

    // 2. Generar embedding de la pregunta
    const preguntaEmbedding = await generarEmbedding(pregunta);
    
    if (!preguntaEmbedding) {
      console.log('⚠️ No se pudo generar embedding, respondiendo sin contexto');
      return res.json({
        success: true,
        respuesta: "👋 ¡Hola! Soy ZENTHOR AI. Para poder ayudarte mejor, necesito que primero subas algunos documentos (PDF, DOCX, TXT) desde la sección de Documentos. Una vez que subas tus apuntes, podré responder preguntas basadas en tu material de estudio.\n\n📄 Ve a la sección 'Documentos IA' y sube tus archivos para comenzar.",
        fuentes: [],
        tiene_contexto: false
      });
    }

    // 3. Calcular similitud con cada documento
    const documentosRelevantes = [];
    for (const doc of documentos || []) {
      if (doc.embedding && Array.isArray(doc.embedding) && doc.embedding.length > 0) {
        const similitud = cosineSimilarity(preguntaEmbedding, doc.embedding);
        if (similitud > 0.3) {
          documentosRelevantes.push({
            id: doc.id,
            titulo: doc.titulo,
            contenido: doc.contenido.substring(0, 1500),
            fuente: doc.fuente,
            similitud: similitud
          });
        }
      }
    }

    documentosRelevantes.sort((a, b) => b.similitud - a.similitud);
    const topDocumentos = documentosRelevantes.slice(0, 5);
    
    console.log(`📊 Documentos relevantes encontrados: ${topDocumentos.length}`);

    // 4. Construir contexto
    const contexto = topDocumentos.length > 0 
      ? topDocumentos.map(doc => `📄 ${doc.titulo}:\n${doc.contenido}\n`).join('\n')
      : 'No hay documentos relevantes disponibles.';

    // 5. Llamar a Groq
    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Eres ZENTHOR AI, un tutor académico experto. 
            Responde de manera clara, amigable y educativa. 
            Usa emojis como 📚, 💡, ✨. 
            Si no sabes algo, dilo honestamente.
            ${topDocumentos.length > 0 ? 'Usa los documentos del estudiante como referencia principal.' : 'El estudiante aún no ha subido documentos. Anímalo a subir sus apuntes.'}`
          },
          {
            role: 'user',
            content: topDocumentos.length > 0 
              ? `Contexto de documentos del estudiante:\n${contexto}\n\nPregunta: ${pregunta}\n\nResponde basándote en el contexto proporcionado.`
              : `Pregunta: ${pregunta}\n\nEl estudiante aún no tiene documentos subidos. Saluda cordialmente y explícale cómo puede subir documentos para obtener respuestas personalizadas.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const respuesta = groqResponse.data.choices[0].message.content;
    console.log('✅ Respuesta generada por Groq');

    // 6. Guardar conversación
    if (conversacion_id) {
      await supabase
        .from('chat_mensajes')
        .insert({
          conversacion_id: conversacion_id,
          rol: 'usuario',
          contenido: pregunta
        });
      
      await supabase
        .from('chat_mensajes')
        .insert({
          conversacion_id: conversacion_id,
          rol: 'asistente',
          contenido: respuesta,
          fuentes: topDocumentos.map(d => ({ titulo: d.titulo, fuente: d.fuente }))
        });
    }

    res.json({
      success: true,
      respuesta: respuesta,
      fuentes: topDocumentos.map(d => ({ titulo: d.titulo, fuente: d.fuente, similitud: d.similitud })),
      tiene_contexto: topDocumentos.length > 0
    });

  } catch (error) {
    console.error('❌ Error en chat RAG:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      respuesta: 'Lo siento, hubo un error procesando tu pregunta. Por favor, intenta de nuevo más tarde.'
    });
  }
};

// Generar guía de estudio
const generarGuia = async (req, res) => {
  const { materia_id, temas, nivel } = req.body;

  if (!materia_id) {
    return res.status(400).json({ success: false, error: 'materia_id es requerido' });
  }

  try {
    const supabase = getSupabaseClient(req.headers.authorization.split(' ')[1]);
    
    // Obtener materia
    const { data: materia, error: materiaError } = await supabase
      .from('materias')
      .select('nombre')
      .eq('id', materia_id)
      .single();

    if (materiaError) throw materiaError;

    // Obtener documentos relacionados
    const { data: documentos, error: docError } = await supabase
      .from('documentos_vector')
      .select('titulo, contenido')
      .eq('usuario_id', req.userId)
      .limit(10);

    if (docError) throw docError;

    const contextoDocs = documentos.map(d => d.contenido).join('\n\n').substring(0, 4000);
    const temasTexto = temas && temas.length > 0 ? temas.join(', ') : 'todos los temas relevantes';

    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Eres un tutor experto que crea guías de estudio personalizadas y de alta calidad.'
          },
          {
            role: 'user',
            content: `Crea una guía de estudio para la materia "${materia.nombre}" sobre los siguientes temas: ${temasTexto}.
            
            Nivel del estudiante: ${nivel || 'universidad'}
            
            Basado en estos documentos del estudiante:
            ${contextoDocs.substring(0, 3000)}
            
            Estructura la guía así:
            1. 📚 Introducción y objetivos
            2. 💡 Conceptos clave (con ejemplos)
            3. 📖 Explicaciones detalladas
            4. ✨ Ejemplos prácticos
            5. 🎯 Ejercicios de práctica (5 ejercicios)
            6. ⚡ Puntos clave para recordar
            7. 📝 Autoevaluación (10 preguntas con respuestas)
            
            Usa emojis educativos y formato Markdown.`
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      },
      {
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
      }
    );

    const guia = groqResponse.data.choices[0].message.content;

    // Guardar guía
    const { data: guiaGuardada, error: saveError } = await supabase
      .from('guias_estudio')
      .insert({
        usuario_id: req.userId,
        materia_id: materia_id,
        titulo: `Guía: ${temasTexto.substring(0, 50)}`,
        contenido: guia,
        temas: temas || []
      })
      .select()
      .single();

    if (saveError) throw saveError;

    res.json({
      success: true,
      guia_id: guiaGuardada.id,
      contenido: guia,
      materia: materia.nombre
    });

  } catch (error) {
    console.error('❌ Error generando guía:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { chat, generarGuia };