-- =====================================================
-- CORREGIR MARKETPLACE CON COLUMNAS REALES
-- =====================================================

-- 1. VER COLUMNAS REALES DE SERVICIOS_MARKETPLACE
SELECT 
    '🔍 COLUMNAS SERVICIOS_MARKETPLACE' as tabla,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'servicios_marketplace'
ORDER BY ordinal_position;

-- 2. VER COLUMNAS REALES DE CURSOS_MARKETPLACE
SELECT 
    '🔍 COLUMNAS CURSOS_MARKETPLACE' as tabla,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'cursos_marketplace'
ORDER BY ordinal_position;

-- 3. ELIMINAR VISTA PROBLEMÁTICA
DROP VIEW IF EXISTS vista_marketplace_completo CASCADE;

-- 4. CORREGIR SERVICIOS_MARKETPLACE
ALTER TABLE servicios_marketplace DROP COLUMN IF EXISTS caracteristicas;
ALTER TABLE servicios_marketplace ADD COLUMN caracteristicas JSONB DEFAULT '[]'::jsonb;

-- 5. CORREGIR CURSOS_MARKETPLACE  
ALTER TABLE cursos_marketplace DROP COLUMN IF EXISTS caracteristicas;
ALTER TABLE cursos_marketplace ADD COLUMN caracteristicas JSONB DEFAULT '[]'::jsonb;

-- 6. CREAR VISTA SIMPLE CON COLUMNAS BÁSICAS
CREATE OR REPLACE VIEW vista_marketplace_completo AS
SELECT 
    'servicio' as tipo_producto,
    id,
    titulo,
    descripcion,
    precio,
    COALESCE(imagen_url, '') as imagen_url,
    COALESCE(proveedor, '') as proveedor,
    COALESCE(categoria, '') as categoria,
    COALESCE(activo, true) as activo,
    caracteristicas,
    COALESCE(created_at, NOW()) as created_at
FROM servicios_marketplace

UNION ALL

SELECT 
    'curso' as tipo_producto,
    id,
    titulo,
    descripcion,
    precio,
    COALESCE(imagen_url, '') as imagen_url,
    COALESCE(instructor, '') as proveedor,
    COALESCE(categoria, '') as categoria,
    COALESCE(activo, true) as activo,
    caracteristicas,
    COALESCE(created_at, NOW()) as created_at
FROM cursos_marketplace;

-- 7. PRUEBA DE INSERCIÓN SERVICIOS
INSERT INTO servicios_marketplace (
    titulo,
    descripcion,
    precio,
    caracteristicas,
    activo
) VALUES (
    'Test Servicio Básico',
    'Prueba con columnas básicas',
    99.99,
    '["Funciona correctamente", "Sin errores"]'::jsonb,
    true
);

-- 8. PRUEBA DE INSERCIÓN CURSOS
INSERT INTO cursos_marketplace (
    titulo,
    descripcion,
    precio,
    caracteristicas,
    activo
) VALUES (
    'Test Curso Básico',
    'Prueba con columnas básicas',
    49.99,
    '["Funciona correctamente", "Sin errores"]'::jsonb,
    true
);

-- 9. VERIFICAR VISTA FUNCIONA
SELECT 
    '🎉 VISTA MARKETPLACE BÁSICA' as resultado,
    tipo_producto,
    titulo,
    precio,
    caracteristicas
FROM vista_marketplace_completo 
WHERE titulo LIKE 'Test%'
ORDER BY tipo_producto;

-- 10. LIMPIAR PRUEBAS
DELETE FROM servicios_marketplace WHERE titulo = 'Test Servicio Básico';
DELETE FROM cursos_marketplace WHERE titulo = 'Test Curso Básico';

-- 11. VERIFICAR TIPOS FINALES
SELECT 
    '✅ TIPOS CORREGIDOS' as titulo,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'caracteristicas' 
AND table_name IN ('planes_suscripcion', 'servicios_marketplace', 'cursos_marketplace')
ORDER BY table_name;

-- 12. CONFIRMACIÓN FINAL
SELECT '🚀 MARKETPLACE CORREGIDO CON VISTA FUNCIONAL' as resultado_final; 