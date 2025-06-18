-- Script de migración para agregar community_id a usuarios existentes
-- Ejecutar este script después de actualizar la estructura de la tabla

-- Agregar la columna community_id si no existe
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS community_id text DEFAULT 'default';

-- Actualizar todos los usuarios existentes que no tengan community_id
UPDATE usuarios 
SET community_id = 'default' 
WHERE community_id IS NULL OR community_id = '';

-- Crear índice para mejorar el rendimiento de consultas por community_id
CREATE INDEX IF NOT EXISTS idx_usuarios_community_id ON usuarios(community_id);

-- Verificar que todos los usuarios tengan community_id
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN community_id IS NOT NULL AND community_id != '' THEN 1 END) as usuarios_con_community_id,
  COUNT(CASE WHEN community_id IS NULL OR community_id = '' THEN 1 END) as usuarios_sin_community_id
FROM usuarios;

-- Mostrar distribución por community_id
SELECT 
  community_id,
  COUNT(*) as cantidad_usuarios
FROM usuarios 
GROUP BY community_id 
ORDER BY cantidad_usuarios DESC; 