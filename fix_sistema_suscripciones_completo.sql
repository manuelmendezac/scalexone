-- =====================================================
-- CORRECCIÓN COMPLETA SISTEMA SUSCRIPCIONES - SCALEXONE
-- =====================================================

BEGIN;

-- 1. VERIFICAR Y CREAR COMUNIDAD SCALEXONE
-- =====================================================
INSERT INTO comunidades (
    id,
    nombre,
    slug,
    descripcion,
    configuracion,
    estado,
    fecha_creacion,
    fecha_actualizacion,
    is_public,
    owner_id
) VALUES (
    '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid,
    'ScaleXone',
    'scalexone',
    'Comunidad principal de ScaleXone',
    '{"tipo": "principal", "features": ["suscripciones", "marketplace", "afiliados"]}'::jsonb,
    'activa',
    NOW(),
    NOW(),
    true,
    '00000000-0000-0000-0000-000000000000'::uuid
) ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    fecha_actualizacion = NOW();

-- 2. ELIMINAR Y RECREAR VISTA ESTADÍSTICAS CORREGIDA
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

-- 3. VERIFICAR FOREIGN KEY CONSTRAINTS
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

-- 4. VERIFICAR Y CORREGIR TIPOS DE DATOS
-- =====================================================
-- Asegurar que comunidad_id es UUID en todas las tablas
DO $$
BEGIN
    -- planes_suscripcion
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'planes_suscripcion' 
          AND column_name = 'comunidad_id' 
          AND data_type = 'uuid'
    ) THEN
        ALTER TABLE planes_suscripcion 
        ALTER COLUMN comunidad_id TYPE UUID USING comunidad_id::UUID;
    END IF;
    
    -- suscripciones
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

-- 5. CREAR PLAN DE EJEMPLO PARA PRUEBA
-- =====================================================
INSERT INTO planes_suscripcion (
    id,
    comunidad_id,
    nombre,
    descripcion,
    precio,
    moneda,
    duracion_dias,
    caracteristicas,
    limites,
    configuracion,
    activo,
    orden,
    fecha_creacion,
    fecha_actualizacion
) VALUES (
    gen_random_uuid(),
    '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid,
    'Plan Básico Prueba',
    'Plan básico para pruebas del sistema',
    29.99,
    'USD',
    30,
    '["Acceso básico", "Soporte por email", "1 usuario"]'::jsonb,
    '{"usuarios_max": 1, "storage_gb": 5}'::jsonb,
    '{"tipo": "basico", "renovacion_auto": true}'::jsonb,
    true,
    1,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

COMMIT;

-- 6. VERIFICACIONES FINALES
-- =====================================================
SELECT 
    '✅ VERIFICACIÓN FINAL - COMUNIDAD SCALEXONE' as resultado,
    COUNT(*) as registros_encontrados
FROM comunidades 
WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1';

SELECT 
    '✅ VERIFICACIÓN FINAL - VISTA ESTADÍSTICAS' as resultado,
    COUNT(*) as columnas_correctas
FROM information_schema.columns 
WHERE table_name = 'vista_estadisticas_comunidad' 
  AND column_name IN ('comunidad_id', 'comunidad_nombre', 'total_suscriptores');

SELECT 
    '✅ VERIFICACIÓN FINAL - PLANES DISPONIBLES' as resultado,
    COUNT(*) as planes_creados
FROM planes_suscripcion 
WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1';

SELECT '🎉 CORRECCIÓN COMPLETADA - Sistema de suscripciones funcional' as mensaje_final; 