const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');

const token = fs.readFileSync('.token', 'utf8').trim();
const userId = fs.readFileSync('.user-id', 'utf8').trim();

if (!token || token === 'undefined' || token === '') {
  console.error('❌ Token no válido o vacío.');
  console.log('📝 Ejecuta primero: node login.js');
  process.exit(1);
}

console.log('🔑 Token cargado correctamente');
console.log('👤 User ID:', userId);

const supabase = createClient(
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

const materias = [
  {
    nombre: "TIB1003 Administración Y Seguridad De Redes",
    profesor: "Jasso Garcia Nicolas",
    horario: "Grupo H",
    color: "#FF6B6B"
  },
  {
    nombre: "TIC1006 Auditoria En Tecnologia De Informacion",
    profesor: "Moreno Porras Miguel Alejandro",
    horario: "Grupo H",
    color: "#4ECDC4"
  },
  {
    nombre: "DAE-2303 Fundamentos De Computo En La Nube",
    profesor: "Cabeza Ortega Jose Juan",
    horario: "Grupo H",
    color: "#45B7D1"
  },
  {
    nombre: "DAD-2304 Gestion De Proyectos",
    profesor: "Flores Chavez Heriberto",
    horario: "Grupo H",
    color: "#96CEB4"
  },
  {
    nombre: "DAD-2305 Metodologia Devops",
    profesor: "Flores Chavez Heriberto",
    horario: "Grupo H",
    color: "#FFEAA7"
  }
];

async function insertMaterias() {
  console.log('📚 Insertando materias...\n');
  
  let count = 0;
  for (const materia of materias) {
    console.log(`➡️ ${materia.nombre}`);
    
    // IMPORTANTE: Incluir explícitamente el usuario_id
    const { data, error } = await supabase
      .from('materias')
      .insert({
        usuario_id: userId,  // <-- CLAVE: Agregar explícitamente el usuario_id
        nombre: materia.nombre,
        profesor: materia.profesor,
        horario: materia.horario,
        color: materia.color,
        activo: true
      })
      .select();
    
    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
      if (error.message.includes('row-level security')) {
        console.error('   💡 Sugerencia: Las políticas RLS no están configuradas correctamente');
        console.error('   📝 Ejecuta el script SQL en Supabase para configurar las políticas');
      }
    } else {
      console.log(`   ✅ Creada con ID: ${data[0].id}`);
      count++;
    }
  }
  
  console.log(`\n✅ ${count} materias insertadas correctamente!`);
  
  if (count > 0) {
    // Listar todas las materias
    const { data: lista } = await supabase
      .from('materias')
      .select('id, nombre, profesor, horario, color')
      .eq('activo', true)
      .order('nombre');
    
    if (lista && lista.length > 0) {
      console.log('\n📋 MIS MATERIAS EN SUPABASE:');
      console.log('─'.repeat(60));
      lista.forEach((m, i) => {
        console.log(`${i+1}. 📘 ${m.nombre}`);
        console.log(`   👨‍🏫 Profesor: ${m.profesor}`);
        console.log(`   ⏰ Horario: ${m.horario}`);
        console.log(`   🎨 Color: ${m.color}`);
        console.log(`   🆔 ID: ${m.id}\n`);
      });
    }
  }
}

insertMaterias();
