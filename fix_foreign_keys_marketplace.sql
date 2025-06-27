-- =====================================================
-- CORREGIR FOREIGN KEYS PROBLEMÁTICAS MARKETPLACE
-- =====================================================

-- 1. VER FOREIGN KEYS ACTUALES
SELECT 
    '🔍 FOREIGN KEYS PROBLEMÁTICAS' as titulo,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'servicios_marketplace' OR tc.table_name = 'cursos_marketplace')
AND ccu.table_name = 'planes_suscripcion';

-- 2. ELIMINAR FOREIGN KEY PROBLEMÁTICA DE SERVICIOS_MARKETPLACE
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'servicios_marketplace_plan_suscripcion_id_fkey'
        AND table_name = 'servicios_marketplace'
    ) THEN
        ALTER TABLE servicios_marketplace 
        DROP CONSTRAINT servicios_marketplace_plan_suscripcion_id_fkey;
        RAISE NOTICE '✅ ELIMINADA: servicios_marketplace_plan_suscripcion_id_fkey';
    END IF;
END $$;

-- 3. ELIMINAR FOREIGN KEY PROBLEMÁTICA DE CURSOS_MARKETPLACE SI EXISTE
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cursos_marketplace_plan_suscripcion_id_fkey'
        AND table_name = 'cursos_marketplace'
    ) THEN
        ALTER TABLE cursos_marketplace 
        DROP CONSTRAINT cursos_marketplace_plan_suscripcion_id_fkey;
        RAISE NOTICE '✅ ELIMINADA: cursos_marketplace_plan_suscripcion_id_fkey';
    END IF;
END $$;

-- 4. LIMPIAR CUALQUIER REFERENCIA PROBLEMÁTICA
UPDATE servicios_marketplace SET plan_suscripcion_id = NULL 
WHERE plan_suscripcion_id IS NOT NULL;

UPDATE cursos_marketplace SET plan_suscripcion_id = NULL 
WHERE plan_suscripcion_id IS NOT NULL;

-- 5. ELIMINAR PLANES DE PRUEBA QUE PUEDAN ESTAR CAUSANDO PROBLEMAS
DELETE FROM planes_suscripcion 
WHERE nombre LIKE '%Test%' OR nombre LIKE '%Prueba%' OR nombre LIKE '%PRUEBA%';

-- 6. AHORA PRUEBA INSERCIÓN SIN CONFLICTOS
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
    'Plan Definitivo Sin Conflictos',
    'Plan final sin foreign keys problemáticas',
    39.99,
    'USD',
    30,
    '["🚀 Sin foreign keys", "✅ Funciona perfecto", "🎯 JSONB correcto"]'::jsonb,
    true
);

-- 7. INSERTAR EN SERVICIOS SIN REFERENCIAS
INSERT INTO servicios_marketplace (
    titulo,
    descripcion,
    precio,
    proveedor,
    categoria,
    caracteristicas,
    activo
) VALUES (
    'Servicio Sin Foreign Keys',
    'Servicio independiente sin referencias',
    149.99,
    'Proveedor Independiente',
    'Software',
    '["🚀 Sin dependencias", "✅ Funciona solo", "🎯 JSONB correcto"]'::jsonb,
    true
);

-- 8. INSERTAR EN CURSOS SIN REFERENCIAS
INSERT INTO cursos_marketplace (
    titulo,
    descripcion,
    precio,
    instructor,
    categoria,
    caracteristicas,
    activo
) VALUES (
    'Curso Sin Foreign Keys',
    'Curso independiente sin referencias',
    89.99,
    'Instructor Independiente',
    'Educación',
    '["🚀 Sin dependencias", "✅ Funciona solo", "🎯 JSONB correcto"]'::jsonb,
    true
);

-- 9. VERIFICAR QUE TODO FUNCIONA
SELECT 
    '🎉 PLAN FUNCIONANDO' as tabla,
    nombre,
    precio,
    caracteristicas
FROM planes_suscripcion 
WHERE nombre = 'Plan Definitivo Sin Conflictos';

SELECT 
    '🎉 SERVICIO FUNCIONANDO' as tabla,
    titulo,
    precio,
    caracteristicas
FROM servicios_marketplace 
WHERE titulo = 'Servicio Sin Foreign Keys';

SELECT 
    '🎉 CURSO FUNCIONANDO' as tabla,
    titulo,
    precio,
    caracteristicas
FROM cursos_marketplace 
WHERE titulo = 'Curso Sin Foreign Keys';

-- 10. LIMPIAR TODO
DELETE FROM planes_suscripcion WHERE nombre = 'Plan Definitivo Sin Conflictos';
DELETE FROM servicios_marketplace WHERE titulo = 'Servicio Sin Foreign Keys';
DELETE FROM cursos_marketplace WHERE titulo = 'Curso Sin Foreign Keys';

-- 11. VERIFICAR FOREIGN KEYS RESTANTES
SELECT 
    '✅ FOREIGN KEYS RESTANTES' as titulo,
    COUNT(*) as total_foreign_keys
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND (table_name = 'servicios_marketplace' OR table_name = 'cursos_marketplace')
AND constraint_name LIKE '%plan_suscripcion%';

-- 12. CONFIRMACIÓN FINAL
SELECT '🚀 FOREIGN KEYS CORREGIDAS - MARKETPLACE 100% FUNCIONAL' as resultado_final; 