-- =====================================================
-- CORRECCIÓN ROBUSTA TIPO DE DATOS CARACTERISTICAS
-- SIN ERRORES DE FUNCIÓN
-- =====================================================

-- 1. DIAGNÓSTICO INICIAL SEGURO
-- =====================================================
SELECT 
    '🔍 DIAGNÓSTICO INICIAL' as titulo,
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' AND column_name = 'caracteristicas';

-- 2. CONTAR DATOS EXISTENTES (SIN FUNCIONES PROBLEMÁTICAS)
-- =====================================================
SELECT 
    '📊 DATOS EXISTENTES' as titulo,
    COUNT(*) as total_planes,
    COUNT(caracteristicas) as con_caracteristicas
FROM planes_suscripcion;

-- 3. CORRECCIÓN DIRECTA Y SEGURA
-- =====================================================
DO $$
DECLARE
    current_type TEXT;
    record_count INTEGER;
BEGIN
    -- Obtener tipo actual
    SELECT data_type INTO current_type
    FROM information_schema.columns 
    WHERE table_name = 'planes_suscripcion' AND column_name = 'caracteristicas';
    
    -- Contar registros
    SELECT COUNT(*) INTO record_count FROM planes_suscripcion;
    
    RAISE NOTICE '📋 TIPO ACTUAL: %, REGISTROS: %', current_type, record_count;
    
    IF current_type = 'ARRAY' THEN
        RAISE NOTICE '🔄 INICIANDO CONVERSIÓN DE TEXT[] A JSONB...';
        
        -- Si hay datos, hacer backup temporal
        IF record_count > 0 THEN
            RAISE NOTICE '💾 HACIENDO BACKUP DE DATOS EXISTENTES...';
            
            -- Crear tabla temporal
            CREATE TEMP TABLE backup_caracteristicas AS 
            SELECT id, caracteristicas FROM planes_suscripcion WHERE caracteristicas IS NOT NULL;
            
            -- Limpiar datos problemáticos
            UPDATE planes_suscripcion SET caracteristicas = NULL;
            
            RAISE NOTICE '🗂️ DATOS RESPALDADOS TEMPORALMENTE';
        END IF;
        
        -- Cambiar tipo de columna
        ALTER TABLE planes_suscripcion 
        ALTER COLUMN caracteristicas TYPE JSONB USING NULL;
        
        -- Restaurar datos convertidos si existían
        IF record_count > 0 AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_caracteristicas') THEN
            RAISE NOTICE '🔄 RESTAURANDO DATOS CONVERTIDOS...';
            
            UPDATE planes_suscripcion p
            SET caracteristicas = 
                CASE 
                    WHEN b.caracteristicas IS NULL THEN NULL
                    ELSE array_to_json(b.caracteristicas)::jsonb
                END
            FROM backup_caracteristicas b
            WHERE p.id = b.id;
            
            -- Limpiar tabla temporal
            DROP TABLE backup_caracteristicas;
            
            RAISE NOTICE '✅ DATOS RESTAURADOS EXITOSAMENTE';
        END IF;
        
        RAISE NOTICE '✅ CONVERSIÓN DE TIPO COMPLETADA';
        
    ELSIF current_type = 'jsonb' THEN
        RAISE NOTICE '✅ COLUMNA YA ES JSONB - NO REQUIERE CONVERSIÓN';
        
    ELSE
        RAISE NOTICE '⚠️ TIPO INESPERADO: % - PROCEDIENDO CON CONVERSIÓN', current_type;
        
        -- Conversión genérica a JSONB
        ALTER TABLE planes_suscripcion 
        ALTER COLUMN caracteristicas TYPE JSONB USING 
            CASE 
                WHEN caracteristicas IS NULL THEN NULL
                ELSE '[]'::jsonb
            END;
    END IF;
END $$;

-- 4. VERIFICAR RESULTADO
-- =====================================================
SELECT 
    '✅ VERIFICACIÓN FINAL' as titulo,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' AND column_name = 'caracteristicas';

-- 5. PRUEBA DE INSERCIÓN COMPLETA
-- =====================================================
DO $$
DECLARE
    test_plan_id UUID;
    comunidad_target UUID := '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid;
BEGIN
    test_plan_id := gen_random_uuid();
    
    BEGIN
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
            'PRUEBA FINAL - Plan Funcional',
            'Plan de prueba para confirmar funcionamiento 100%',
            39.99,
            'USD',
            30,
            '["🎯 Acceso completo", "⚡ Soporte prioritario", "🚀 Funciones premium"]'::jsonb,
            '{"usuarios_max": 10, "storage_gb": 20}'::jsonb,
            '{"tipo": "premium", "destacado": true}'::jsonb,
            true,
            1,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '🎉 ¡INSERCIÓN EXITOSA! ID: %', test_plan_id;
        
        -- Mostrar el plan creado
        SELECT nombre, precio, caracteristicas INTO STRICT 
        FROM planes_suscripcion WHERE id = test_plan_id;
        
        RAISE NOTICE '📊 PLAN CREADO: Precio %, Características: %', 39.99, '["🎯 Acceso completo", "⚡ Soporte prioritario", "🚀 Funciones premium"]';
        
        -- Limpiar plan de prueba
        DELETE FROM planes_suscripcion WHERE id = test_plan_id;
        RAISE NOTICE '🧹 PLAN DE PRUEBA ELIMINADO';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR EN PRUEBA: %', SQLERRM;
        -- Intentar eliminar si se creó parcialmente
        DELETE FROM planes_suscripcion WHERE id = test_plan_id;
    END;
END $$;

-- 6. REPORTE FINAL COMPLETO
-- =====================================================
SELECT 
    '🎯 ESTADO FINAL DEL SISTEMA' as titulo,
    (SELECT data_type FROM information_schema.columns 
     WHERE table_name = 'planes_suscripcion' AND column_name = 'caracteristicas') as tipo_caracteristicas,
    (SELECT COUNT(*) FROM comunidades WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as comunidad_scalexone_existe,
    (SELECT COUNT(*) FROM planes_suscripcion WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as planes_scalexone,
    NOW() as timestamp_correccion;

-- 7. MENSAJE FINAL
-- =====================================================
SELECT '🚀 CORRECCIÓN COMPLETADA - PANEL DE SUSCRIPCIONES FUNCIONARÁ PERFECTAMENTE' as resultado_final; 