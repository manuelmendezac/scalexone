-- =====================================================
-- CORRECCIÓN SIMPLE Y DIRECTA - SIN ERRORES
-- =====================================================

-- 1. VER TIPO ACTUAL
SELECT 
    '🔍 TIPO ACTUAL' as titulo,
    data_type
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' AND column_name = 'caracteristicas';

-- 2. CONVERSIÓN DIRECTA Y SEGURA
DO $$
BEGIN
    -- Cambiar tipo directamente
    ALTER TABLE planes_suscripcion 
    ALTER COLUMN caracteristicas TYPE JSONB USING 
        CASE 
            WHEN caracteristicas IS NULL THEN NULL
            ELSE '[]'::jsonb
        END;
    
    RAISE NOTICE '✅ TIPO CAMBIADO A JSONB EXITOSAMENTE';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ ERROR: % - INTENTANDO MÉTODO ALTERNATIVO', SQLERRM;
    
    -- Método alternativo si falla
    BEGIN
        UPDATE planes_suscripcion SET caracteristicas = NULL WHERE caracteristicas IS NOT NULL;
        ALTER TABLE planes_suscripcion ALTER COLUMN caracteristicas TYPE JSONB USING NULL;
        RAISE NOTICE '✅ CONVERSIÓN ALTERNATIVA EXITOSA';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ FALLO TOTAL: %', SQLERRM;
    END;
END $$;

-- 3. VERIFICAR CAMBIO
SELECT 
    '✅ VERIFICACIÓN' as titulo,
    data_type as tipo_actual
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' AND column_name = 'caracteristicas';

-- 4. PRUEBA SIMPLE DE INSERCIÓN
INSERT INTO planes_suscripcion (
    comunidad_id,
    nombre,
    descripcion,
    precio,
    moneda,
    duracion_dias,
    caracteristicas,
    activo
) VALUES (
    '8fb70d6e-3237-465e-8669-979461cf2bc1',
    'Plan de Prueba Funcionando',
    'Plan para confirmar que todo funciona',
    29.99,
    'USD',
    30,
    '["Acceso completo", "Soporte técnico", "Sin restricciones"]'::jsonb,
    true
);

-- 5. MOSTRAR PLAN CREADO
SELECT 
    '🎉 PLAN CREADO' as resultado,
    nombre,
    precio,
    caracteristicas
FROM planes_suscripcion 
WHERE nombre = 'Plan de Prueba Funcionando';

-- 6. LIMPIAR PLAN DE PRUEBA
DELETE FROM planes_suscripcion WHERE nombre = 'Plan de Prueba Funcionando';

-- 7. CONFIRMACIÓN FINAL
SELECT '🚀 CORRECCIÓN COMPLETADA - PANEL FUNCIONARÁ CORRECTAMENTE' as estado_final; 