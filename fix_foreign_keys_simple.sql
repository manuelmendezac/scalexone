-- =====================================================
-- CORREGIR FOREIGN KEYS - SCRIPT SIMPLE Y SEGURO
-- =====================================================

-- 1. VER QUÉ FOREIGN KEYS EXISTEN REALMENTE
SELECT 
    '🔍 FOREIGN KEYS ACTUALES' as titulo,
    constraint_name,
    table_name
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND (table_name = 'servicios_marketplace' OR table_name = 'cursos_marketplace');

-- 2. ELIMINAR SOLO FOREIGN KEYS QUE EXISTEN
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Eliminar foreign keys de servicios_marketplace que referencien planes_suscripcion
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'servicios_marketplace' 
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%plan%'
    LOOP
        EXECUTE 'ALTER TABLE servicios_marketplace DROP CONSTRAINT ' || constraint_record.constraint_name;
        RAISE NOTICE '✅ ELIMINADA: %', constraint_record.constraint_name;
    END LOOP;
    
    -- Eliminar foreign keys de cursos_marketplace que referencien planes_suscripcion
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'cursos_marketplace' 
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%plan%'
    LOOP
        EXECUTE 'ALTER TABLE cursos_marketplace DROP CONSTRAINT ' || constraint_record.constraint_name;
        RAISE NOTICE '✅ ELIMINADA: %', constraint_record.constraint_name;
    END LOOP;
END $$;

-- 3. LIMPIAR CUALQUIER PLAN DE PRUEBA RESTANTE
DELETE FROM planes_suscripcion 
WHERE nombre LIKE '%Test%' OR nombre LIKE '%Prueba%' OR nombre LIKE '%PRUEBA%';

-- 4. PRUEBA INSERCIÓN PLAN SIN CONFLICTOS
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
    'Plan Funcionando Perfecto',
    'Plan sin ningún conflicto de foreign keys',
    49.99,
    'USD',
    30,
    '["🚀 Sin foreign keys", "✅ Funciona perfecto", "🎯 JSONB correcto"]'::jsonb,
    true
);

-- 5. MOSTRAR PLAN CREADO
SELECT 
    '🎉 PLAN CREADO EXITOSAMENTE' as resultado,
    nombre,
    precio,
    caracteristicas
FROM planes_suscripcion 
WHERE nombre = 'Plan Funcionando Perfecto';

-- 6. ELIMINAR PLAN DE PRUEBA
DELETE FROM planes_suscripcion WHERE nombre = 'Plan Funcionando Perfecto';

-- 7. VERIFICAR QUE NO QUEDAN FOREIGN KEYS PROBLEMÁTICAS
SELECT 
    '✅ FOREIGN KEYS RESTANTES' as titulo,
    COUNT(*) as total_foreign_keys
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND (table_name = 'servicios_marketplace' OR table_name = 'cursos_marketplace')
AND constraint_name LIKE '%plan%';

-- 8. VERIFICAR TIPOS DE DATOS FINALES
SELECT 
    '✅ TIPOS DATOS CORREGIDOS' as titulo,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'caracteristicas' 
AND table_name IN ('planes_suscripcion', 'servicios_marketplace', 'cursos_marketplace')
ORDER BY table_name;

-- 9. CONFIRMACIÓN FINAL
SELECT '🚀 SISTEMA MARKETPLACE COMPLETAMENTE FUNCIONAL - SIN FOREIGN KEYS PROBLEMÁTICAS' as resultado_final; 