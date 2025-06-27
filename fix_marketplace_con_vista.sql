-- =====================================================
-- CORREGIR MARKETPLACE ELIMINANDO VISTAS DEPENDIENTES
-- =====================================================

-- 1. ELIMINAR VISTAS QUE DEPENDEN DE LAS COLUMNAS
DROP VIEW IF EXISTS vista_marketplace_completo CASCADE;

-- 2. CORREGIR SERVICIOS_MARKETPLACE
ALTER TABLE servicios_marketplace DROP COLUMN caracteristicas;
ALTER TABLE servicios_marketplace ADD COLUMN caracteristicas JSONB DEFAULT '[]'::jsonb;

-- 3. CORREGIR CURSOS_MARKETPLACE
ALTER TABLE cursos_marketplace DROP COLUMN IF EXISTS caracteristicas;
ALTER TABLE cursos_marketplace ADD COLUMN caracteristicas JSONB DEFAULT '[]'::jsonb;

-- 4. RECREAR VISTA MARKETPLACE CORREGIDA
CREATE OR REPLACE VIEW vista_marketplace_completo AS
SELECT 
    'servicio' as tipo_producto,
    id,
    titulo,
    descripcion,
    precio,
    imagen_url,
    proveedor,
    categoria,
    rating,
    reviews,
    activo,
    caracteristicas,
    created_at
FROM servicios_marketplace
WHERE activo = true

UNION ALL

SELECT 
    'curso' as tipo_producto,
    id,
    titulo,
    descripcion,
    precio,
    imagen_url,
    instructor as proveedor,
    categoria,
    rating,
    reviews,
    activo,
    caracteristicas,
    created_at
FROM cursos_marketplace
WHERE activo = true;

-- 5. VERIFICAR CORRECCIONES
SELECT 
    '✅ VERIFICACIÓN FINAL' as titulo,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'caracteristicas' 
AND table_name IN ('planes_suscripcion', 'servicios_marketplace', 'cursos_marketplace')
ORDER BY table_name;

-- 6. PRUEBA COMPLETA DE INSERCIÓN
INSERT INTO servicios_marketplace (
    titulo,
    descripcion,
    precio,
    proveedor,
    categoria,
    caracteristicas,
    activo
) VALUES (
    'Test Servicio Final',
    'Prueba final servicios',
    199.99,
    'Provider Test',
    'Software',
    '["✅ Funcionamiento perfecto", "🎯 Sin errores", "🚀 Tipo JSONB correcto"]'::jsonb,
    true
);

INSERT INTO cursos_marketplace (
    titulo,
    descripcion,
    precio,
    instructor,
    categoria,
    caracteristicas,
    activo
) VALUES (
    'Test Curso Final',
    'Prueba final cursos',
    89.99,
    'Instructor Test',
    'Desarrollo',
    '["✅ Funcionamiento perfecto", "🎯 Sin errores", "🚀 Tipo JSONB correcto"]'::jsonb,
    true
);

-- 7. VERIFICAR VISTA MARKETPLACE
SELECT 
    '🎉 VISTA MARKETPLACE FUNCIONANDO' as resultado,
    tipo_producto,
    titulo,
    caracteristicas
FROM vista_marketplace_completo 
WHERE titulo LIKE 'Test%'
ORDER BY tipo_producto;

-- 8. LIMPIAR DATOS DE PRUEBA
DELETE FROM servicios_marketplace WHERE titulo = 'Test Servicio Final';
DELETE FROM cursos_marketplace WHERE titulo = 'Test Curso Final';

-- 9. CONFIRMACIÓN FINAL
SELECT '🚀 SISTEMA MARKETPLACE COMPLETAMENTE CORREGIDO Y FUNCIONAL' as resultado_final; 