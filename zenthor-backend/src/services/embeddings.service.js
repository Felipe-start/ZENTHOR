const axios = require('axios');
const { supabaseAdmin } = require('../config/supabase');

// ✅ URL CORRECTA de Hugging Face
const HF_API_URL = 'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2';

const generarEmbedding = async (texto) => {
  try {
    console.log('🔄 Generando embedding para texto de longitud:', texto.length);
    
    const response = await axios.post(
      HF_API_URL,
      {
        inputs: texto.substring(0, 5000),
        options: { wait_for_model: true }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    
    console.log('✅ Embedding generado exitosamente');
    return response.data;
  } catch (error) {
    console.error('❌ Error generando embedding:', error.response?.status, error.response?.data || error.message);
    return null;
  }
};

const vectorizarDocumento = async (userId, titulo, contenido, fuente, metadata = {}) => {
  try {
    const embedding = await generarEmbedding(contenido);
    
    if (!embedding) {
      throw new Error('No se pudo generar el embedding');
    }

    const { data, error } = await supabaseAdmin
      .from('documentos_vector')
      .insert({
        usuario_id: userId,
        titulo: titulo,
        contenido: contenido,
        fuente: fuente,
        embedding: embedding,
        metadata: metadata,
        creado_en: new Date(),
        actualizado_en: new Date()
      })
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Documento vectorizado: ${titulo}`);
    return data;
  } catch (error) {
    console.error('❌ Error vectorizando:', error.message);
    throw error;
  }
};

module.exports = { generarEmbedding, vectorizarDocumento };