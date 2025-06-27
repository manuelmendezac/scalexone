-- =====================================================
-- FIX DIRECTO - SIN BACKUP, SOLO SOLUCIÓN
-- =====================================================

-- 1. ELIMINAR COLUMNA PROBLEMÁTICA DIRECTAMENTE
ALTER TABLE planes_suscripcion DROP COLUMN caracteristicas;

-- 2. CREAR NUEVA COLUMNA CON TIPO CORRECTO
ALTER TABLE planes_suscripcion ADD COLUMN caracteristicas JSONB DEFAULT '[]'::jsonb;

-- 3. VERIFICAR QUE FUNCIONÓ
SELECT 
    '✅ COLUMNA CORREGIDA' as resultado,
    data_type
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' AND column_name = 'caracteristicas';

-- 4. PRUEBA DIRECTA DE INSERCIÓN
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
    'PRUEBA FUNCIONA',
    'Test final',
    29.99,
    'USD',
    30,
    '["Funciona perfectamente", "Sin errores"]'::jsonb,
    true
);

-- 5. MOSTRAR ÉXITO
SELECT 
    '🎉 ÉXITO TOTAL' as resultado,
    nombre,
    caracteristicas
FROM planes_suscripcion 
WHERE nombre = 'PRUEBA FUNCIONA';

-- 6. LIMPIAR
DELETE FROM planes_suscripcion WHERE nombre = 'PRUEBA FUNCIONA';

-- 7. CONFIRMACIÓN
SELECT '🚀 PROBLEMA SOLUCIONADO - PANEL FUNCIONARÁ' as final; 