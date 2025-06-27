-- =====================================================
-- DIAGNÓSTICO Y CORRECCIÓN DIRECTA FOREIGN KEY - SCALEXONE
-- =====================================================

-- 1. VERIFICAR SI LA COMUNIDAD SCALEXONE EXISTE
-- =====================================================
DO $$
DECLARE
    comunidad_existe INTEGER;
BEGIN
    SELECT COUNT(*) INTO comunidad_existe 
    FROM comunidades 
    WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid;
    
    IF comunidad_existe = 0 THEN
        RAISE NOTICE '❌ COMUNIDAD SCALEXONE NO EXISTE - CREÁNDOLA AHORA';
        
        INSERT INTO comunidades (
            id,
            nombre,
            slug,
            descripcion,
            configuracion,
            estado,
            fecha_creacion,
            fecha_actualizacion,
            is_public
        ) VALUES (
            '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid,
            'ScaleXone',
            'scalexone',
            'Comunidad principal de ScaleXone',
            '{}'::jsonb,
            'activa',
            NOW(),
            NOW(),
            true
        );
        
        RAISE NOTICE '✅ COMUNIDAD SCALEXONE CREADA EXITOSAMENTE';
    ELSE
        RAISE NOTICE '✅ COMUNIDAD SCALEXONE YA EXISTE (%)', comunidad_existe;
    END IF;
END $$;

-- 2. VERIFICAR ESTRUCTURA ACTUAL DE FOREIGN KEYS
-- =====================================================
SELECT 
    '🔍 FOREIGN KEYS ACTUALES EN PLANES_SUSCRIPCION' as diagnostico,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'planes_suscripcion';

-- 3. ELIMINAR TODAS LAS FOREIGN KEYS PROBLEMÁTICAS
-- =====================================================
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name = 'planes_suscripcion'
            AND tc.constraint_name LIKE '%comunidad%'
    LOOP
        EXECUTE 'ALTER TABLE planes_suscripcion DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
        RAISE NOTICE '🗑️ Eliminada constraint: %', constraint_record.constraint_name;
    END LOOP;
END $$;

-- 4. VERIFICAR TIPOS DE DATOS
-- =====================================================
SELECT 
    '📋 TIPOS DE DATOS' as diagnostico,
    'comunidades.id' as tabla_columna,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'comunidades' AND column_name = 'id'

UNION ALL

SELECT 
    '📋 TIPOS DE DATOS' as diagnostico,
    'planes_suscripcion.comunidad_id' as tabla_columna,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' AND column_name = 'comunidad_id';

-- 5. CORREGIR TIPOS SI ES NECESARIO
-- =====================================================
DO $$
BEGIN
    -- Asegurar que ambas columnas son UUID
    BEGIN
        ALTER TABLE planes_suscripcion ALTER COLUMN comunidad_id TYPE UUID USING comunidad_id::UUID;
        RAISE NOTICE '✅ Tipo UUID aplicado a planes_suscripcion.comunidad_id';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Ya es UUID o error: %', SQLERRM;
    END;
END $$;

-- 6. CREAR FOREIGN KEY CORRECTA
-- =====================================================
DO $$
BEGIN
    BEGIN
        ALTER TABLE planes_suscripcion 
        ADD CONSTRAINT planes_suscripcion_comunidad_id_fkey 
        FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE CASCADE;
        
        RAISE NOTICE '✅ FOREIGN KEY CREADA EXITOSAMENTE';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR CREANDO FOREIGN KEY: %', SQLERRM;
    END;
END $$;

-- 7. PRUEBA DIRECTA DE INSERCIÓN
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
            'TEST - Plan Diagnóstico Final',
            'Plan de prueba para verificar corrección',
            29.99,
            'USD',
            30,
            '["Característica de prueba"]'::jsonb,
            '{}'::jsonb,
            '{}'::jsonb,
            true,
            1,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '🎉 PLAN DE PRUEBA CREADO EXITOSAMENTE: %', test_plan_id;
        
        -- Eliminar el plan de prueba inmediatamente
        DELETE FROM planes_suscripcion WHERE id = test_plan_id;
        RAISE NOTICE '🗑️ Plan de prueba eliminado - TODO FUNCIONA CORRECTAMENTE';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR EN PRUEBA DE INSERCIÓN: %', SQLERRM;
    END;
END $$;

-- 8. VERIFICACIÓN FINAL
-- =====================================================
SELECT 
    '✅ VERIFICACIÓN FINAL - COMUNIDAD' as resultado,
    id,
    nombre,
    estado
FROM comunidades 
WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1';

SELECT 
    '✅ VERIFICACIÓN FINAL - FOREIGN KEYS' as resultado,
    COUNT(*) as total_constraints
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'planes_suscripcion'
    AND constraint_name LIKE '%comunidad%';

SELECT '🎯 DIAGNÓSTICO Y CORRECCIÓN COMPLETADA' as mensaje_final; 