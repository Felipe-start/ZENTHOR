const axios = require('axios');
const { supabaseAdmin } = require('../config/supabase');

const HF_API_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';

const generarEmbedding = async (texto) => {
  try {
    const response = await axios.post(
      HF_API_URL,
      {
        inputs: texto.substring(0, 5000), // Limitar a 5000 caracteres
        options: { wait_for_model: true }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error generando embedding:', error.message);
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
        fuente: fuente,
        contenido: contenido,
        embedding: embedding,
        metadata: metadata
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error vectorizando documento:', error);
    throw error;
  }
};

module.exports = { generarEmbedding, vectorizarDocumento };