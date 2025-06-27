-- =====================================================
-- DIAGNÓSTICO PRECISO SISTEMA SUSCRIPCIONES - SCALEXONE
-- =====================================================

-- 1. VERIFICAR COMUNIDAD SCALEXONE (YA EXISTE)
-- =====================================================
SELECT 
    '🏢 COMUNIDAD SCALEXONE EXISTENTE' as titulo,
    id,
    nombre,
    slug,
    estado
FROM comunidades 
WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid;

-- 2. VERIFICAR ESTRUCTURA TABLA PLANES_SUSCRIPCION
-- =====================================================
SELECT 
    '📋 ESTRUCTURA PLANES_SUSCRIPCION' as titulo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion'
  AND column_name IN ('id', 'comunidad_id')
ORDER BY ordinal_position;

-- 3. VERIFICAR FOREIGN KEY ACTUAL
-- =====================================================
SELECT 
    '🔗 FOREIGN KEY CONSTRAINTS' as titulo,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'planes_suscripcion'
    AND kcu.column_name = 'comunidad_id';

-- 4. VERIFICAR TIPOS DE DATOS EN AMBAS TABLAS
-- =====================================================
SELECT 
    '🔍 COMPARACIÓN TIPOS DE DATOS' as titulo,
    'comunidades.id' as tabla_columna,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'comunidades' AND column_name = 'id'

UNION ALL

SELECT 
    '🔍 COMPARACIÓN TIPOS DE DATOS' as titulo,
    'planes_suscripcion.comunidad_id' as tabla_columna,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' AND column_name = 'comunidad_id';

-- 5. INTENTAR CREAR PLAN DE PRUEBA DIRECTAMENTE
-- =====================================================
DO $$
DECLARE
    test_plan_id UUID;
BEGIN
    BEGIN
        test_plan_id := gen_random_uuid();
        
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
            test_plan_id,
            '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid,
            'TEST - Plan Diagnóstico',
            'Plan de prueba para diagnóstico',
            19.99,
            'USD',
            30,
            '["Test feature"]'::jsonb,
            '{}'::jsonb,
            '{}'::jsonb,
            true,
            999,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ PLAN DE PRUEBA CREADO EXITOSAMENTE: %', test_plan_id;
        
        -- Eliminar el plan de prueba
        DELETE FROM planes_suscripcion WHERE id = test_plan_id;
        RAISE NOTICE '🗑️ Plan de prueba eliminado';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR AL CREAR PLAN: %', SQLERRM;
    END;
END $$;

-- 6. VERIFICAR VISTA ESTADÍSTICAS ACTUAL
-- =====================================================
SELECT 
    '📊 VISTA ESTADÍSTICAS ACTUAL' as titulo,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'vista_estadisticas_comunidad'
ORDER BY ordinal_position;

-- 7. PLANES EXISTENTES PARA ESTA COMUNIDAD
-- =====================================================
SELECT 
    '📋 PLANES EXISTENTES SCALEXONE' as titulo,
    COUNT(*) as total_planes
FROM planes_suscripcion 
WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid; 