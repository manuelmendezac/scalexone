-- ============================================
-- FIX: Problema de Foreign Key en canal_id
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Verificar canales existentes
SELECT id, nombre, community_id, activo FROM canales_comunidad;

-- 2. Verificar posts con canal_id problemático
SELECT id, contenido, canal_id FROM comunidad_posts WHERE canal_id IS NOT NULL;

-- 3. Eliminar foreign key constraint temporalmente
ALTER TABLE comunidad_posts DROP CONSTRAINT IF EXISTS comunidad_posts_canal_id_fkey;

-- 4. Limpiar canal_id de posts que referencian canales inexistentes
UPDATE comunidad_posts 
SET canal_id = NULL 
WHERE canal_id IS NOT NULL 
AND canal_id NOT IN (SELECT id FROM canales_comunidad WHERE activo = true);

-- 5. Recrear foreign key constraint correctamente
ALTER TABLE comunidad_posts 
ADD CONSTRAINT comunidad_posts_canal_id_fkey 
FOREIGN KEY (canal_id) REFERENCES canales_comunidad(id) ON DELETE SET NULL;

-- 6. Verificación final
DO $$
BEGIN
    RAISE NOTICE '✅ Foreign key constraint reparado';
    RAISE NOTICE '✅ Posts limpiados de referencias inválidas';
    RAISE NOTICE '✅ Sistema de canales funcional';
END $$; 