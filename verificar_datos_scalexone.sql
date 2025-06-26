-- ============================================
-- VERIFICACIÓN COMPLETA DE DATOS SCALEXONE
-- ============================================

-- 1. Verificar comunidad ScaleXone
SELECT 'COMUNIDAD SCALEXONE' as seccion;
SELECT 
  id, nombre, slug, owner_id, is_public, descripcion
FROM comunidades 
WHERE slug = 'scalexone' OR nombre ILIKE '%scalex%';

-- 2. Verificar usuarios de ScaleXone
SELECT 'USUARIOS SCALEXONE' as seccion;
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN community_id = 'scalexone' THEN 1 END) as usuarios_scalexone,
  COUNT(CASE WHEN community_id = 'default' THEN 1 END) as usuarios_default
FROM usuarios;

-- 3. Verificar canales de ScaleXone
SELECT 'CANALES SCALEXONE' as seccion;
SELECT 
  COUNT(*) as total_canales_sistema
FROM canales_comunidad;

-- Buscar canales por UUID de ScaleXone
WITH scalexone_uuid AS (
  SELECT id FROM comunidades WHERE slug = 'scalexone' LIMIT 1
)
SELECT 
  cc.id, cc.nombre, cc.descripcion, cc.activo, cc.community_id,
  c.nombre as comunidad_nombre
FROM canales_comunidad cc
LEFT JOIN comunidades c ON cc.community_id = c.id
WHERE cc.community_id IN (SELECT id FROM scalexone_uuid);

-- 4. Verificar función get_canales_por_comunidad
SELECT 'FUNCIÓN CANALES' as seccion;
WITH scalexone_uuid AS (
  SELECT id FROM comunidades WHERE slug = 'scalexone' LIMIT 1
)
SELECT * FROM get_canales_por_comunidad((SELECT id FROM scalexone_uuid));

-- 5. Verificar posts de comunidad
SELECT 'POSTS COMUNIDAD' as seccion;
SELECT 
  COUNT(*) as total_posts
FROM comunidad_posts;

-- 6. Verificar si existe tabla de cursos
SELECT 'TABLAS CURSOS' as seccion;
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'cursos'
) as tabla_cursos_existe;

-- 7. Verificar niveles de usuarios
SELECT 'NIVELES USUARIOS' as seccion;
SELECT 
  COUNT(*) as usuarios_con_nivel,
  AVG(nivel_usuario) as nivel_promedio,
  MAX(nivel_usuario) as nivel_maximo
FROM usuarios 
WHERE nivel_usuario IS NOT NULL AND community_id = 'scalexone';

-- 8. Verificar suscripciones activas
SELECT 'SUSCRIPCIONES SCALEXONE' as seccion;
WITH scalexone_uuid AS (
  SELECT id FROM comunidades WHERE slug = 'scalexone' LIMIT 1
)
SELECT 
  COUNT(*) as total_suscripciones,
  COUNT(CASE WHEN estado = 'activa' THEN 1 END) as suscripciones_activas
FROM suscripciones s
WHERE s.comunidad_id IN (SELECT id FROM scalexone_uuid);

-- 9. Verificar planes de suscripción
SELECT 'PLANES SCALEXONE' as seccion;
WITH scalexone_uuid AS (
  SELECT id FROM comunidades WHERE slug = 'scalexone' LIMIT 1
)
SELECT 
  p.nombre, p.precio, p.activo
FROM planes_suscripcion p
WHERE p.comunidad_id IN (SELECT id FROM scalexone_uuid);

-- 10. Verificar estructura de datos crítica
SELECT 'ESTRUCTURA CRÍTICA' as seccion;
SELECT 
  'usuarios.community_id tipo: ' || data_type as info
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND column_name = 'community_id'
UNION ALL
SELECT 
  'canales_comunidad.community_id tipo: ' || data_type as info
FROM information_schema.columns 
WHERE table_name = 'canales_comunidad' AND column_name = 'community_id'; 