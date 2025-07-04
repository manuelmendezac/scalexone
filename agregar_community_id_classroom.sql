-- =====================================================
-- AGREGAR COMMUNITY_ID A CLASSROOM_MODULOS
-- =====================================================
-- Este script agrega la columna community_id a la tabla classroom_modulos
-- para que cada comunidad pueda tener sus propios módulos de classroom

-- 1. Agregar columna community_id a classroom_modulos
ALTER TABLE classroom_modulos 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES comunidades(id) ON DELETE CASCADE;

-- 2. Agregar columna community_id a videos_classroom_modulo también
ALTER TABLE videos_classroom_modulo 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES comunidades(id) ON DELETE CASCADE;

-- 3. Agregar columna community_id a recursos_classroom_modulo
ALTER TABLE recursos_classroom_modulo 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES comunidades(id) ON DELETE CASCADE;

-- 4. Migrar módulos existentes al community_id de Scalexone
-- Primero, obtener el UUID de la comunidad Scalexone
DO $$
DECLARE
    scalexone_community_id UUID;
BEGIN
    -- Obtener el UUID de la comunidad Scalexone
    SELECT id INTO scalexone_community_id 
    FROM comunidades 
    WHERE nombre = 'scalexone' OR slug = 'scalexone' 
    LIMIT 1;
    
    -- Si no existe, usar el UUID por defecto
    IF scalexone_community_id IS NULL THEN
        scalexone_community_id := '8fb70d6e-3237-465e-8669-979461cf2bc1';
    END IF;
    
    -- Actualizar módulos existentes
    UPDATE classroom_modulos 
    SET community_id = scalexone_community_id 
    WHERE community_id IS NULL;
    
    -- Actualizar videos existentes
    UPDATE videos_classroom_modulo 
    SET community_id = scalexone_community_id 
    WHERE community_id IS NULL;
    
    -- Actualizar recursos existentes
    UPDATE recursos_classroom_modulo 
    SET community_id = scalexone_community_id 
    WHERE community_id IS NULL;
    
    RAISE NOTICE 'Módulos migrados al community_id: %', scalexone_community_id;
END $$;

-- 5. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_classroom_modulos_community_id ON classroom_modulos(community_id);
CREATE INDEX IF NOT EXISTS idx_videos_classroom_community_id ON videos_classroom_modulo(community_id);
CREATE INDEX IF NOT EXISTS idx_recursos_classroom_community_id ON recursos_classroom_modulo(community_id);

-- 6. Verificar la migración
SELECT 
    '✅ MIGRACIÓN COMPLETADA' as estado,
    COUNT(*) as total_modulos,
    COUNT(CASE WHEN community_id IS NOT NULL THEN 1 END) as modulos_con_community_id
FROM classroom_modulos;

-- 7. Mostrar módulos por comunidad
SELECT 
    c.nombre as comunidad,
    COUNT(cm.id) as total_modulos
FROM classroom_modulos cm
LEFT JOIN comunidades c ON cm.community_id = c.id
GROUP BY c.nombre, c.id
ORDER BY total_modulos DESC; 