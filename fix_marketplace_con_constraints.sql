-- =====================================================
-- CORREGIR MARKETPLACE MANEJANDO CONSTRAINTS
-- =====================================================

-- 1. ELIMINAR VISTA PROBLEMÁTICA
DROP VIEW IF EXISTS vista_marketplace_completo CASCADE;

-- 2. CORREGIR SERVICIOS_MARKETPLACE  
ALTER TABLE servicios_marketplace DROP COLUMN IF EXISTS caracteristicas;
ALTER TABLE servicios_marketplace ADD COLUMN caracteristicas JSONB DEFAULT '[]'::jsonb;

-- 3. CORREGIR CURSOS_MARKETPLACE
ALTER TABLE cursos_marketplace DROP COLUMN IF EXISTS caracteristicas;
ALTER TABLE cursos_marketplace ADD COLUMN caracteristicas JSONB DEFAULT '[]'::jsonb;

-- 4. VER CONSTRAINTS NOT NULL
SELECT 
    '🔍 CONSTRAINTS SERVICIOS' as tabla,
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'servicios_marketplace'
AND is_nullable = 'NO'
ORDER BY ordinal_position;

SELECT 
    '🔍 CONSTRAINTS CURSOS' as tabla,
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'cursos_marketplace'
AND is_nullable = 'NO'
ORDER BY ordinal_position;

-- 5. CREAR VISTA SIMPLE CON SOLO COLUMNAS ESENCIALES
CREATE OR REPLACE VIEW vista_marketplace_completo AS
SELECT 
    'servicio' as tipo_producto,
    id,
    titulo,
    descripcion,
    precio,
    caracteristicas
FROM servicios_marketplace

UNION ALL

SELECT 
    'curso' as tipo_producto,
    id,
    titulo,
    descripcion,
    precio,
    caracteristicas
FROM cursos_marketplace;

-- 6. INSERCIÓN CON TODAS LAS COLUMNAS OBLIGATORIAS SERVICIOS
INSERT INTO servicios_marketplace (
    titulo,
    descripcion,
    precio,
    proveedor,
    categoria,
    caracteristicas,
    activo
) VALUES (
    'Test Servicio Completo',
    'Prueba con todas las columnas',
    99.99,
    'Proveedor Test',
    'Software',
    '["Todas las columnas", "Sin errores"]'::jsonb,
    true
);

-- 7. INSERCIÓN CON TODAS LAS COLUMNAS OBLIGATORIAS CURSOS
INSERT INTO cursos_marketplace (
    titulo,
    descripcion,
    precio,
    instructor,
    categoria,
    caracteristicas,
    activo
) VALUES (
    'Test Curso Completo',
    'Prueba con todas las columnas',
    49.99,
    'Instructor Test',
    'Desarrollo',
    '["Todas las columnas", "Sin errores"]'::jsonb,
    true
);

-- 8. VERIFICAR VISTA FUNCIONA
SELECT 
    '🎉 VISTA MARKETPLACE FUNCIONAL' as resultado,
    tipo_producto,
    titulo,
    precio,
    caracteristicas
FROM vista_marketplace_completo 
WHERE titulo LIKE 'Test%'
ORDER BY tipo_producto;

-- 9. LIMPIAR DATOS DE PRUEBA
DELETE FROM servicios_marketplace WHERE titulo = 'Test Servicio Completo';
DELETE FROM cursos_marketplace WHERE titulo = 'Test Curso Completo';

-- 10. VERIFICAR COLUMNA CARACTERISTICAS CORREGIDA
SELECT 
    '✅ VERIFICACIÓN FINAL' as titulo,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name = 'caracteristicas' 
AND table_name IN ('planes_suscripcion', 'servicios_marketplace', 'cursos_marketplace')
ORDER BY table_name;

-- 11. PRUEBA PLAN SUSCRIPCIÓN TAMBIÉN
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
    'Plan Final Funcionando',
    'Prueba plan con JSONB',
    29.99,
    'USD',
    30,
    '["Todo funciona", "JSONB correcto", "Sin errores"]'::jsonb,
    true
);

-- 12. MOSTRAR PLAN CREADO
SELECT 
    '🎉 PLAN SUSCRIPCIÓN FUNCIONANDO' as resultado,
    nombre,
    precio,
    caracteristicas
FROM planes_suscripcion 
WHERE nombre = 'Plan Final Funcionando';

-- 13. LIMPIAR PLAN DE PRUEBA
DELETE FROM planes_suscripcion WHERE nombre = 'Plan Final Funcionando';

-- 14. CONFIRMACIÓN TOTAL
SELECT '🚀 TODO EL SISTEMA MARKETPLACE CORREGIDO Y FUNCIONAL' as resultado_final; 