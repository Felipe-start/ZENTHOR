const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  console.log('Probando obtener usuario de auth...');
  const { data, error } = await supabaseAdmin.auth.admin.getUserById('1c964aa2-ef69-4806-b89e-8237057571aa');
  
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('✅ Usuario encontrado:', data.user?.email);
  }
}

test();
