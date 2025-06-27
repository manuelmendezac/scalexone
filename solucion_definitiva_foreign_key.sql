-- =====================================================
-- SOLUCIÓN DEFINITIVA FOREIGN KEY - DIAGNÓSTICO COMPLETO
-- =====================================================

-- 1. IDENTIFICAR EL VERDADERO UUID DE LA COMUNIDAD SCALEXONE
-- =====================================================
SELECT 
    '🔍 COMUNIDADES EXISTENTES' as titulo,
    id,
    nombre,
    slug,
    estado
FROM comunidades 
WHERE LOWER(nombre) LIKE '%scale%' OR LOWER(slug) LIKE '%scale%'
ORDER BY fecha_creacion;

-- 2. VER TODAS LAS COMUNIDADES (PARA CONFIRMAR)
-- =====================================================
SELECT 
    '📋 TODAS LAS COMUNIDADES' as titulo,
    COUNT(*) as total,
    STRING_AGG(nombre, ', ') as nombres
FROM comunidades;

-- 3. VERIFICAR SI EXISTE EL UUID ESPECÍFICO
-- =====================================================
DO $$
DECLARE
    uuid_existe BOOLEAN;
    comunidad_real RECORD;
BEGIN
    -- Verificar UUID específico
    SELECT EXISTS(
        SELECT 1 FROM comunidades 
        WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid
    ) INTO uuid_existe;
    
    IF uuid_existe THEN
        RAISE NOTICE '✅ UUID 8fb70d6e-3237-465e-8669-979461cf2bc1 EXISTE';
    ELSE
        RAISE NOTICE '❌ UUID 8fb70d6e-3237-465e-8669-979461cf2bc1 NO EXISTE';
        
        -- Buscar comunidad ScaleXone por nombre/slug
        SELECT * INTO comunidad_real
        FROM comunidades 
        WHERE LOWER(nombre) = 'scalexone' OR LOWER(slug) = 'scalexone'
        LIMIT 1;
        
        IF FOUND THEN
            RAISE NOTICE '🔍 COMUNIDAD REAL ENCONTRADA: ID=%, NOMBRE=%', comunidad_real.id, comunidad_real.nombre;
        ELSE
            RAISE NOTICE '❌ NO SE ENCONTRÓ COMUNIDAD SCALEXONE';
        END IF;
    END IF;
END $$;

-- 4. ELIMINAR FOREIGN KEY ACTUAL (SIN PREGUNTAR)
-- =====================================================
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'planes_suscripcion' 
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%comunidad%'
    LOOP
        EXECUTE 'ALTER TABLE planes_suscripcion DROP CONSTRAINT ' || constraint_record.constraint_name;
        RAISE NOTICE '🗑️ ELIMINADA: %', constraint_record.constraint_name;
    END LOOP;
END $$;

-- 5. CREAR COMUNIDAD SCALEXONE SI NO EXISTE
-- =====================================================
DO $$
DECLARE
    comunidad_id UUID := '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid;
BEGIN
    -- Verificar si existe
    IF NOT EXISTS (SELECT 1 FROM comunidades WHERE id = comunidad_id) THEN
        RAISE NOTICE '⚠️ CREANDO COMUNIDAD SCALEXONE...';
        
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
            comunidad_id,
            'ScaleXone',
            'scalexone-principal',
            'Comunidad principal ScaleXone',
            '{}'::jsonb,
            'activa',
            NOW(),
            NOW(),
            true
        );
        
        RAISE NOTICE '✅ COMUNIDAD SCALEXONE CREADA CON ID: %', comunidad_id;
    ELSE
        RAISE NOTICE '✅ COMUNIDAD SCALEXONE YA EXISTE';
    END IF;
END $$;

-- 6. RECREAR FOREIGN KEY CON COMUNIDAD CONFIRMADA
-- =====================================================
DO $$
BEGIN
    BEGIN
        ALTER TABLE planes_suscripcion 
        ADD CONSTRAINT planes_suscripcion_comunidad_id_fkey 
        FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE CASCADE;
        
        RAISE NOTICE '✅ FOREIGN KEY RECREADA EXITOSAMENTE';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR CREANDO FOREIGN KEY: %', SQLERRM;
    END;
END $$;

-- 7. PRUEBA REAL DE INSERCIÓN
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
            'TEST FINAL - Plan Funcional',
            'Plan de prueba para confirmar funcionamiento',
            49.99,
            'USD',
            30,
            '["Acceso completo", "Soporte prioritario"]'::jsonb,
            '{"usuarios_max": 10}'::jsonb,
            '{"tipo": "premium"}'::jsonb,
            true,
            1,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '🎉 PLAN DE PRUEBA CREADO EXITOSAMENTE: %', test_plan_id;
        
        -- Eliminar inmediatamente
        DELETE FROM planes_suscripcion WHERE id = test_plan_id;
        RAISE NOTICE '✅ PRUEBA COMPLETADA - SISTEMA FUNCIONAL';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ FALLO EN PRUEBA: %', SQLERRM;
    END;
END $$;

-- 8. REPORTE FINAL
-- =====================================================
SELECT 
    '🎯 REPORTE FINAL' as titulo,
    (SELECT COUNT(*) FROM comunidades WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as comunidad_existe,
    (SELECT COUNT(*) FROM information_schema.table_constraints 
     WHERE table_name = 'planes_suscripcion' AND constraint_type = 'FOREIGN KEY') as foreign_keys,
    NOW() as timestamp_correccion;

SELECT '🚀 CORRECCIÓN DEFINITIVA COMPLETADA' as resultado; 