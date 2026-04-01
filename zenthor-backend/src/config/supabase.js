const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Cliente para operaciones que requieren privilegios elevados (ej. recordatorios)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Función para crear cliente autenticado por usuario (respeta RLS)
const getSupabaseClient = (token) => {
  if (!token) {
    throw new Error('Token no proporcionado');
  }
  
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
};

module.exports = {
  supabaseAdmin,
  getSupabaseClient
};
