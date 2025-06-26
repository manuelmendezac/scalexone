-- VERIFICAR DATOS ACTUALES DE COMUNIDAD Y USUARIO

-- 1. Verificar usuario homodeus
SELECT 'DATOS USUARIO HOMODEUS' as consulta;
SELECT 
  id, email, name, community_id, rol, created_at
FROM usuarios 
WHERE email = 'homodeus.cith@gmail.com';

-- 2. Verificar comunidad ScaleXOne
SELECT 'DATOS COMUNIDAD SCALEXONE' as consulta;
SELECT 
  id, nombre, slug, owner_id, is_public, descripcion, 
  logo_url, banner_url, logo_horizontal_url, configuracion
FROM comunidades 
WHERE slug = 'scalexone';

-- 3. Verificar relación usuario-comunidad
SELECT 'RELACIÓN USUARIO-COMUNIDAD' as consulta;
SELECT 
  u.email,
  u.community_id,
  u.rol,
  c.nombre as comunidad_nombre,
  c.slug,
  c.owner_id,
  CASE 
    WHEN c.owner_id = u.id THEN 'SÍ ES OWNER'
    ELSE 'NO ES OWNER'
  END as es_owner
FROM usuarios u
LEFT JOIN comunidades c ON c.slug = u.community_id
WHERE u.email = 'homodeus.cith@gmail.com';

-- 4. Verificar si existe la tabla de storage
SELECT 'BUCKETS DE STORAGE' as consulta;
SELECT name, public FROM storage.buckets; 