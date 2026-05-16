const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente admin para operaciones que requieren privilegios elevados (bypass RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Cliente público (sin autenticación)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para crear cliente autenticado por usuario (respeta RLS)
const getSupabaseClient = (token) => {
  if (!token) {
    throw new Error('Token no proporcionado');
  }
  
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
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
  supabase,
  getSupabaseClient
};