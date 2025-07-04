const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar definidos en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTablasLaunchpad() {
  console.log('🔍 Verificando tablas de Launchpad...');
  
  const tablas = [
    'launchpad_events',
    'launchpad_links', 
    'launchpad_settings',
    'launchpad_videos',
    'launchpad_video_ratings',
    'launchpad_video_comments'
  ];
  
  for (const tabla of tablas) {
    try {
      console.log(`\n📋 Verificando tabla: ${tabla}`);
      
      // Verificar si la tabla existe
      const { data, error } = await supabase
        .from(tabla)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabla ${tabla} no existe o hay error:`, error.message);
      } else {
        console.log(`✅ Tabla ${tabla} existe`);
        
        // Verificar si tiene community_id
        const { data: sampleData } = await supabase
          .from(tabla)
          .select('*')
          .limit(1);
        
        if (sampleData && sampleData.length > 0) {
          const hasCommunityId = 'community_id' in sampleData[0];
          console.log(`   - Tiene community_id: ${hasCommunityId ? '✅' : '❌'}`);
          
          if (hasCommunityId) {
            console.log(`   - community_id: ${sampleData[0].community_id}`);
          }
        }
        
        // Contar registros
        const { count } = await supabase
          .from(tabla)
          .select('*', { count: 'exact', head: true });
        
        console.log(`   - Total registros: ${count || 0}`);
      }
      
    } catch (err) {
      console.error(`❌ Error verificando ${tabla}:`, err.message);
    }
  }
}

verificarTablasLaunchpad(); 