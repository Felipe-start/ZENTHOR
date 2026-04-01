const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function login() {
  const email = 'luisfelipearellano2004@gmail.com';
  const password = 'Zenthor2026!';
  
  console.log('🔐 Iniciando sesión...');
  console.log('📧 Email:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  console.log('\n✅ Sesión iniciada exitosamente!');
  console.log('🆔 User ID:', data.user.id);
  console.log('📧 Email confirmado:', data.user.email_confirmed_at ? 'Sí ✅' : 'No ⚠️');
  console.log('\n🎫 TOKEN:');
  console.log(data.session.access_token);
  
  const fs = require('fs');
  fs.writeFileSync('.token', data.session.access_token);
  console.log('\n💾 Token guardado en archivo .token');
}

login();