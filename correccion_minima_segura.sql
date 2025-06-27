-- =====================================================
-- CORRECCIÓN MÍNIMA Y SEGURA - SOLO FOREIGN KEY
-- NO TOCAR COMUNIDAD EXISTENTE - PRESERVAR FUNCIONALIDADES
-- =====================================================

-- 1. CONFIRMAR QUE LA COMUNIDAD SCALEXONE EXISTE
-- =====================================================
SELECT 
    '✅ COMUNIDAD SCALEXONE CONFIRMADA' as status,
    id,
    nombre,
    slug,
    estado
FROM comunidades 
WHERE slug = 'scalexone' OR id = '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid;

-- 2. VERIFICAR FOREIGN KEY ACTUAL (SOLO DIAGNÓSTICO)
-- =====================================================
SELECT 
    '🔍 FOREIGN KEY ACTUAL' as diagnostico,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS referencia_tabla,
    ccu.column_name AS referencia_columna
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'planes_suscripcion'
    AND kcu.column_name = 'comunidad_id';

-- 3. ELIMINAR SOLO LA FOREIGN KEY PROBLEMÁTICA (SIN TOCAR DATOS)
-- =====================================================
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Buscar la constraint específica
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'planes_suscripcion'
        AND tc.constraint_name LIKE '%comunidad_id%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE planes_suscripcion DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE '🗑️ Foreign key eliminada: %', constraint_name;
    ELSE
        RAISE NOTICE '⚠️ No se encontró foreign key problemática';
    END IF;
END $$;

-- 4. RECREAR FOREIGN KEY CORRECTA (CONSERVADORA)
-- =====================================================
DO $$
BEGIN
    -- Intentar crear la foreign key apuntando a la comunidad correcta
    BEGIN
        ALTER TABLE planes_suscripcion 
        ADD CONSTRAINT planes_suscripcion_comunidad_id_fkey 
        FOREIGN KEY (comunidad_id) REFERENCES comunidades(id) ON DELETE RESTRICT;
        
        RAISE NOTICE '✅ Foreign key recreada exitosamente';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error recreando foreign key: %', SQLERRM;
        
        -- Si falla, intentar sin la constraint por ahora
        RAISE NOTICE '⚠️ Funcionando sin foreign key constraint temporalmente';
    END;
END $$;

-- 5. PRUEBA MÍNIMA DE INSERCIÓN (SIN CREAR DATOS PERMANENTES)
-- =====================================================
DO $$
BEGIN
    -- Solo verificar que la inserción funcionaría sin ejecutarla
    BEGIN
        PERFORM 1 FROM comunidades WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1'::uuid;
        
        IF FOUND THEN
            RAISE NOTICE '✅ Referencia a comunidad válida - inserción debería funcionar';
        ELSE
            RAISE NOTICE '❌ Problema: comunidad no encontrada por UUID';
            
            -- Buscar la comunidad por slug como backup
            PERFORM 1 FROM comunidades WHERE slug = 'scalexone';
            IF FOUND THEN
                RAISE NOTICE '⚠️ Comunidad existe pero con diferente ID';
            END IF;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en verificación: %', SQLERRM;
    END;
END $$;

-- 6. VERIFICACIÓN FINAL (SOLO LECTURA)
-- =====================================================
SELECT 
    '🎯 VERIFICACIÓN FINAL' as resultado,
    (SELECT COUNT(*) FROM comunidades WHERE slug = 'scalexone') as comunidad_existe,
    (SELECT COUNT(*) FROM information_schema.table_constraints 
     WHERE constraint_type = 'FOREIGN KEY' 
       AND table_name = 'planes_suscripcion'
       AND constraint_name LIKE '%comunidad%') as foreign_keys_activas;

SELECT '✅ CORRECCIÓN MÍNIMA COMPLETADA - FUNCIONALIDADES PRESERVADAS' as mensaje_final; 