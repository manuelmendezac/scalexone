const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function ejecutarSQL() {
  try {
    console.log('🔄 Ejecutando script de retiros de afiliados...');
    
    // Leer el archivo SQL
    const sqlContent = fs.readFileSync('crear_tabla_retiros_afiliados.sql', 'utf8');
    
    // Dividir el SQL en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Encontrados ${commands.length} comandos SQL para ejecutar`);
    
    // Ejecutar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`\n🔄 Ejecutando comando ${i + 1}/${commands.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: command + ';'
        });
        
        if (error) {
          console.error(`❌ Error en comando ${i + 1}:`, error);
          // Continuar con el siguiente comando
        } else {
          console.log(`✅ Comando ${i + 1} ejecutado exitosamente`);
        }
      }
    }
    
    console.log('\n🎉 Script de retiros de afiliados ejecutado completamente');
    
  } catch (error) {
    console.error('❌ Error ejecutando script:', error);
  }
}

// Ejecutar el script
ejecutarSQL(); 