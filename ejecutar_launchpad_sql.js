const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar definidos en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function ejecutarScriptLaunchpad() {
  console.log('🚀 Ejecutando script SQL para Launchpad...');
  
  try {
    // Leer el archivo SQL
    const fs = require('fs');
    const sqlContent = fs.readFileSync('agregar_community_id_launchpad.sql', 'utf8');
    
    // Dividir el SQL en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Ejecutando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`  ${i + 1}/${commands.length}: ${command.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql_query: command });
        
        if (error) {
          console.error(`❌ Error en comando ${i + 1}:`, error.message);
          // Continuar con el siguiente comando
        } else {
          console.log(`✅ Comando ${i + 1} ejecutado correctamente`);
        }
      }
    }
    
    console.log('🎉 Script SQL para Launchpad completado');
    
  } catch (error) {
    console.error('❌ Error ejecutando script:', error);
  }
}

ejecutarScriptLaunchpad(); 