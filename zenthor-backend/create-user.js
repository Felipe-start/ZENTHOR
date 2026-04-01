const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function createUser() {
  const email = 'luisfelipearellano2004@gmail.com';
  const password = 'Zenthor2026!';
  
  console.log('📝 Creando usuario...');
  console.log('🔗 Conectando a:', process.env.SUPABASE_URL);
  console.log('📧 Email:', email);
  
  // Crear usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre_completo: 'Luis Felipe Arellano Roque',
        nivel_educativo: 'universidad'
      }
    }
  });
  
  if (authError) {
    console.error('❌ Error al crear usuario:', authError.message);
    return;
  }
  
  console.log('\n✅ Usuario creado exitosamente!');
  console.log('📧 Email:', email);
  console.log('🔑 Password:', password);
  console.log('🆔 User ID:', authData.user?.id);
  
  if (authData.session?.access_token) {
    console.log('\n🎫 TOKEN (sesión iniciada):');
    console.log(authData.session.access_token);
    
    const fs = require('fs');
    fs.writeFileSync('.token', authData.session.access_token);
    console.log('\n💾 Token guardado en archivo .token');
  } else {
    console.log('\n⚠️  Se ha enviado un correo de confirmación a tu email.');
    console.log('📧 Revisa tu bandeja de entrada: luisfelipearellano2004@gmail.com');
    console.log('🔗 Haz clic en el enlace de confirmación para activar tu cuenta.');
    console.log('\n✅ Después de confirmar, ejecuta node login.js para obtener tu token.');
  }
  
  // Guardar user ID para referencia
  const fs = require('fs');
  if (authData.user?.id) {
    fs.writeFileSync('.user-id', authData.user.id);
    console.log('💾 User ID guardado en archivo .user-id');
  }
}

createUser();
