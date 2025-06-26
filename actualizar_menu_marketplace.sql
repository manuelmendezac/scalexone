-- Script para actualizar el menú cambiando IA por Marketplace
-- Ejecutar en Supabase SQL Editor

-- Actualizar la configuración del menú para cambiar IA por Marketplace
UPDATE menu_secundario_config 
SET config = jsonb_set(
  config,
  '{7}', -- Posición del elemento IA (índice 7 en el array)
  '{"id": "marketplace", "label": "Marketplace", "icon": "🛒", "path": "/marketplace", "visible": true, "orden": 8}'::jsonb
)
WHERE community_id = 'default';

-- Verificar el cambio
SELECT config FROM menu_secundario_config WHERE community_id = 'default';

-- Si no existe la configuración, crearla con Marketplace en lugar de IA
INSERT INTO menu_secundario_config (community_id, config) 
VALUES ('default', '[
  {"id": "home", "label": "Inicio", "icon": "🏠", "path": "/home", "visible": true, "orden": 1},
  {"id": "clasificacion", "label": "Clasificación", "icon": "📊", "path": "/clasificacion", "visible": true, "orden": 2},
  {"id": "classroom", "label": "Classroom", "icon": "🎓", "path": "/classroom", "visible": true, "orden": 3},
  {"id": "cursos", "label": "Cursos", "icon": "📚", "path": "/cursos", "visible": true, "orden": 4},
  {"id": "launchpad", "label": "Launchpad", "icon": "🚀", "path": "/launchpad", "visible": true, "orden": 5},
  {"id": "comunidad", "label": "Comunidad", "icon": "👥", "path": "/comunidad", "visible": true, "orden": 6},
  {"id": "funnels", "label": "Embudos", "icon": "🫧", "path": "/funnels", "visible": true, "orden": 7},
  {"id": "marketplace", "label": "Marketplace", "icon": "🛒", "path": "/marketplace", "visible": true, "orden": 8},
  {"id": "automatizaciones", "label": "Automatizaciones", "icon": "⚙️", "path": "/automatizaciones", "visible": true, "orden": 9},
  {"id": "whatsapp-crm", "label": "WhatsApp CRM", "icon": "💬", "path": "/whatsapp-crm", "visible": true, "orden": 10},
  {"id": "configuracion", "label": "Configuración", "icon": "🔧", "path": "/configuracion-admin", "visible": true, "orden": 11}
]'::jsonb)
ON CONFLICT (community_id) DO UPDATE SET
  config = EXCLUDED.config,
  updated_at = timezone('utc'::text, now()); 