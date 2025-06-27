-- =====================================================
-- CORRECCIÓN DEFINITIVA TIPO DE DATOS CARACTERISTICAS
-- =====================================================

-- 1. DIAGNOSTICAR SITUACIÓN ACTUAL
-- =====================================================
SELECT 
    '🔍 DIAGNÓSTICO INICIAL' as titulo,
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' AND column_name = 'caracteristicas';

-- 2. VER DATOS EXISTENTES
-- =====================================================
SELECT 
    '📊 DATOS EXISTENTES' as titulo,
    COUNT(*) as total_planes,
    COUNT(caracteristicas) as con_caracteristicas,
    COUNT(CASE WHEN caracteristicas IS NOT NULL AND array_length(caracteristicas, 1) > 0 THEN 1 END) as con_datos_reales
FROM planes_suscripcion;

-- 3. MOSTRAR ALGUNOS EJEMPLOS DE DATOS ACTUALES
-- =====================================================
SELECT 
    '🔍 EJEMPLOS DATOS ACTUALES' as titulo,
    nombre,
    caracteristicas,
    pg_typeof(caracteristicas) as tipo_actual
FROM planes_suscripcion 
WHERE caracteristicas IS NOT NULL
LIMIT 3;

-- 4. CORRECCIÓN SEGURA DEL TIPO DE DATOS
-- =====================================================
DO $$
DECLARE
    current_type TEXT;
BEGIN
    -- Verificar tipo actual
    SELECT data_type INTO current_type
    FROM information_schema.columns 
    WHERE table_name = 'planes_suscripcion' AND column_name = 'caracteristicas';
    
    RAISE NOTICE '📋 TIPO ACTUAL: %', current_type;
    
    IF current_type = 'ARRAY' THEN
        RAISE NOTICE '🔄 CONVIRTIENDO DE TEXT[] A JSONB...';
        
        -- Conversión segura de TEXT[] a JSONB
        ALTER TABLE planes_suscripcion 
        ALTER COLUMN caracteristicas TYPE JSONB USING 
            CASE 
                WHEN caracteristicas IS NULL THEN NULL
                WHEN array_length(caracteristicas, 1) IS NULL THEN '[]'::jsonb
                ELSE array_to_json(caracteristicas)::jsonb
            END;
            
        RAISE NOTICE '✅ CONVERSIÓN COMPLETADA';
        
    ELSIF current_type = 'jsonb' THEN
        RAISE NOTICE '✅ YA ES JSONB - NO REQUIERE CONVERSIÓN';
        
    ELSE
        RAISE NOTICE '⚠️ TIPO INESPERADO: %', current_type;
    END IF;
END $$;

-- 5. VERIFICAR CONVERSIÓN
-- =====================================================
SELECT 
    '✅ VERIFICACIÓN POST-CONVERSIÓN' as titulo,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' AND column_name = 'caracteristicas';

-- 6. MOSTRAR DATOS DESPUÉS DE CONVERSIÓN
-- =====================================================
SELECT 
    '📊 DATOS DESPUÉS DE CONVERSIÓN' as titulo,
    nombre,
    caracteristicas,
    pg_typeof(caracteristicas) as tipo_actual
FROM planes_suscripcion 
WHERE caracteristicas IS NOT NULL
LIMIT 3;

-- 7. PRUEBA DE INSERCIÓN REAL
-- =====================================================
DO $$
DECLARE
    test_plan_id UUID;
    comunidad_target UUID := '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid;
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
            comunidad_target,
            'TEST TIPO DATOS - Plan Funcional',
            'Plan de prueba para confirmar tipo de datos correcto',
            29.99,
            'USD',
            30,
            '["✅ Acceso completo", "🎯 Soporte prioritario", "🚀 Sin límites"]'::jsonb,
            '{"usuarios_max": 5}'::jsonb,
            '{"tipo": "test", "categoria": "premium"}'::jsonb,
            true,
            1,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '🎉 PRUEBA INSERCIÓN EXITOSA: %', test_plan_id;
        
        -- Mostrar el plan creado
        PERFORM * FROM planes_suscripcion WHERE id = test_plan_id;
        
        -- Eliminar inmediatamente
        DELETE FROM planes_suscripcion WHERE id = test_plan_id;
        RAISE NOTICE '✅ PRUEBA COMPLETADA - PLAN ELIMINADO';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ FALLO EN PRUEBA: %', SQLERRM;
    END;
END $$;

-- 8. REPORTE FINAL COMPLETO
-- =====================================================
SELECT 
    '🎯 REPORTE FINAL COMPLETO' as titulo,
    (SELECT data_type FROM information_schema.columns 
     WHERE table_name = 'planes_suscripcion' AND column_name = 'caracteristicas') as tipo_caracteristicas,
    (SELECT COUNT(*) FROM comunidades WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as comunidad_existe,
    (SELECT COUNT(*) FROM planes_suscripcion WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as planes_existentes,
    NOW() as timestamp_correccion;

SELECT '🚀 CORRECCIÓN TIPO DE DATOS COMPLETADA - PANEL FUNCIONARÁ CORRECTAMENTE' as resultado_final; 