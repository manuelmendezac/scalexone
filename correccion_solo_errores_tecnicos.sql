-- =====================================================
-- CORRECCIÓN SOLO ERRORES TÉCNICOS - SCALEXONE
-- Sin crear planes de ejemplo - Admin crea los que necesite
-- =====================================================

BEGIN;

-- 1. CORREGIR VISTA ESTADÍSTICAS (Error de columna comunidad_id)
-- =====================================================
DROP VIEW IF EXISTS vista_estadisticas_comunidad;

CREATE VIEW vista_estadisticas_comunidad AS
SELECT 
    c.id as comunidad_id,
    c.nombre as comunidad_nombre,
    c.slug as comunidad_slug,
    COALESCE(COUNT(s.id), 0) as total_suscriptores,
    COALESCE(COUNT(CASE WHEN s.estado = 'activa' THEN 1 END), 0) as suscriptores_activos,
    COALESCE(COUNT(p.id), 0) as total_planes,
    COALESCE(SUM(CASE WHEN s.estado = 'activa' THEN COALESCE(s.precio_pagado, p.precio, 0) ELSE 0 END), 0) as ingresos_totales,
    COALESCE(
        SUM(CASE 
            WHEN s.estado = 'activa' 
                AND s.fecha_creacion >= DATE_TRUNC('month', CURRENT_DATE) 
            THEN COALESCE(s.precio_pagado, p.precio, 0) 
            ELSE 0 
        END), 0
    ) as ingresos_mes_actual
FROM comunidades c
LEFT JOIN planes_suscripcion p ON p.comunidad_id = c.id
LEFT JOIN suscripciones s ON s.plan_id = p.id AND s.comunidad_id = c.id
GROUP BY c.id, c.nombre, c.slug;

-- 2. VERIFICAR Y CORREGIR FOREIGN KEY CONSTRAINT
-- =====================================================
-- Eliminar foreign key problemática si existe
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'planes_suscripcion'
      AND tc.constraint_name LIKE '%comunidad_id%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE planes_suscripcion DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END IF;
END $$;

-- Recrear foreign key correcta
ALTER TABLE planes_suscripcion 
ADD CONSTRAINT planes_suscripcion_comunidad_id_fkey 
FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE CASCADE;

-- 3. VERIFICAR TIPOS DE DATOS UUID
-- =====================================================
DO $$
BEGIN
    -- Asegurar que comunidad_id es UUID en planes_suscripcion
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'planes_suscripcion' 
          AND column_name = 'comunidad_id' 
          AND data_type = 'uuid'
    ) THEN
        ALTER TABLE planes_suscripcion 
        ALTER COLUMN comunidad_id TYPE UUID USING comunidad_id::UUID;
    END IF;
    
    -- Asegurar que comunidad_id es UUID en suscripciones
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'suscripciones' 
          AND column_name = 'comunidad_id' 
          AND data_type = 'uuid'
    ) THEN
        ALTER TABLE suscripciones 
        ALTER COLUMN comunidad_id TYPE UUID USING comunidad_id::UUID;
    END IF;
END $$;

COMMIT;

-- 4. VERIFICACIONES FINALES
-- =====================================================
SELECT 
    '✅ VISTA ESTADÍSTICAS CORREGIDA' as resultado,
    COUNT(*) as columnas_correctas
FROM information_schema.columns 
WHERE table_name = 'vista_estadisticas_comunidad' 
  AND column_name IN ('comunidad_id', 'comunidad_nombre', 'total_suscriptores');

SELECT 
    '✅ FOREIGN KEY CORREGIDA' as resultado,
    COUNT(*) as constraints_activos
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'planes_suscripcion'
  AND tc.constraint_name LIKE '%comunidad_id%';

SELECT 
    '✅ COMUNIDAD SCALEXONE OPERATIVA' as resultado,
    id,
    nombre,
    estado
FROM comunidades 
WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1';

SELECT '🎉 CORRECCIONES TÉCNICAS COMPLETADAS - Listo para crear planes como admin' as mensaje_final; 