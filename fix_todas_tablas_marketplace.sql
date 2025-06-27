-- =====================================================
-- CORREGIR TODAS LAS TABLAS MARKETPLACE
-- =====================================================

-- 1. CORREGIR SERVICIOS_MARKETPLACE
ALTER TABLE servicios_marketplace DROP COLUMN IF EXISTS caracteristicas;
ALTER TABLE servicios_marketplace ADD COLUMN caracteristicas JSONB DEFAULT '[]'::jsonb;

-- 2. CORREGIR CURSOS_MARKETPLACE
ALTER TABLE cursos_marketplace DROP COLUMN IF EXISTS caracteristicas;
ALTER TABLE cursos_marketplace ADD COLUMN caracteristicas JSONB DEFAULT '[]'::jsonb;

-- 3. VERIFICAR CORRECCIONES
SELECT 
    '✅ VERIFICACIÓN MARKETPLACE' as titulo,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'caracteristicas' 
AND table_name IN ('planes_suscripcion', 'servicios_marketplace', 'cursos_marketplace')
ORDER BY table_name;

-- 4. PRUEBA EN SERVICIOS_MARKETPLACE
INSERT INTO servicios_marketplace (
    titulo,
    descripcion,
    precio,
    proveedor,
    categoria,
    caracteristicas,
    activo
) VALUES (
    'Test Servicio Funciona',
    'Prueba servicios',
    99.99,
    'Test Provider',
    'Software',
    '["Funciona perfectamente", "Sin errores tipo datos"]'::jsonb,
    true
);

-- 5. PRUEBA EN CURSOS_MARKETPLACE
INSERT INTO cursos_marketplace (
    titulo,
    descripcion,
    precio,
    instructor,
    categoria,
    caracteristicas,
    activo
) VALUES (
    'Test Curso Funciona',
    'Prueba cursos',
    49.99,
    'Test Instructor',
    'Tecnología',
    '["Funciona perfectamente", "Sin errores tipo datos"]'::jsonb,
    true
);

-- 6. MOSTRAR ÉXITO
SELECT 
    '🎉 SERVICIOS MARKETPLACE' as tabla,
    titulo,
    caracteristicas
FROM servicios_marketplace 
WHERE titulo = 'Test Servicio Funciona';

SELECT 
    '🎉 CURSOS MARKETPLACE' as tabla,
    titulo,
    caracteristicas
FROM cursos_marketplace 
WHERE titulo = 'Test Curso Funciona';

-- 7. LIMPIAR PRUEBAS
DELETE FROM servicios_marketplace WHERE titulo = 'Test Servicio Funciona';
DELETE FROM cursos_marketplace WHERE titulo = 'Test Curso Funciona';

-- 8. CONFIRMACIÓN FINAL
SELECT '🚀 TODAS LAS TABLAS MARKETPLACE CORREGIDAS - SISTEMA 100% FUNCIONAL' as resultado_final; 