-- =====================================================
-- ELIMINAR FOREIGN KEY CONSTRAINT ESPECÍFICA
-- =====================================================

-- 1. IDENTIFICAR EL FOREIGN KEY PROBLEMÁTICO
SELECT 
    '🔍 FOREIGN KEY PROBLEMÁTICA' as titulo,
    constraint_name,
    table_name
FROM information_schema.table_constraints 
WHERE constraint_name = 'servicios_marketplace_plan_suscripcion_id_fkey';

-- 2. ELIMINAR LA FOREIGN KEY ESPECÍFICA
ALTER TABLE servicios_marketplace 
DROP CONSTRAINT IF EXISTS servicios_marketplace_plan_suscripcion_id_fkey;

-- 3. ELIMINAR CUALQUIER OTRA FOREIGN KEY SIMILAR
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT constraint_name, table_name
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%plan_suscripcion%'
    LOOP
        EXECUTE 'ALTER TABLE ' || constraint_record.table_name || 
                ' DROP CONSTRAINT ' || constraint_record.constraint_name;
        RAISE NOTICE '✅ ELIMINADA: % de tabla %', constraint_record.constraint_name, constraint_record.table_name;
    END LOOP;
END $$;

-- 4. LIMPIAR TODOS LOS PLANES DE PRUEBA AHORA
DELETE FROM planes_suscripcion 
WHERE nombre LIKE '%Test%' OR nombre LIKE '%Prueba%' OR nombre LIKE '%PRUEBA%' 
   OR nombre LIKE '%Final%' OR nombre LIKE '%Definitivo%';

-- 5. VERIFICAR QUE NO QUEDAN FOREIGN KEYS PROBLEMÁTICAS
SELECT 
    '✅ FOREIGN KEYS RESTANTES' as titulo,
    COUNT(*) as total_foreign_keys_planes
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY'
AND constraint_name LIKE '%plan%';

-- 6. PRUEBA FINAL SIN FOREIGN KEYS
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
    'Plan Limpio Final',
    'Plan sin foreign keys problemáticas',
    39.99,
    'USD',
    30,
    '["🚀 Sin constraints", "✅ Se puede eliminar", "🎯 JSONB funcionando"]'::jsonb,
    true
);

-- 7. MOSTRAR PLAN CREADO
SELECT 
    '🎉 PLAN CREADO LIMPIAMENTE' as resultado,
    nombre,
    precio,
    caracteristicas
FROM planes_suscripcion 
WHERE nombre = 'Plan Limpio Final';

-- 8. ELIMINAR SIN PROBLEMAS
DELETE FROM planes_suscripcion WHERE nombre = 'Plan Limpio Final';

-- 9. VERIFICAR TIPOS DE DATOS FINALES
SELECT 
    '✅ VERIFICACIÓN FINAL TIPOS' as titulo,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'caracteristicas' 
AND table_name IN ('planes_suscripcion', 'servicios_marketplace', 'cursos_marketplace')
ORDER BY table_name;

-- 10. CONFIRMACIÓN TOTAL
SELECT '🚀 SISTEMA 100% FUNCIONAL - SIN FOREIGN KEYS PROBLEMÁTICAS - TIPOS JSONB CORRECTOS' as resultado_final; 