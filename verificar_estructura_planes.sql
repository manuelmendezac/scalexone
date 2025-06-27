-- Verificar la estructura real de la tabla planes_suscripcion
SELECT 
    '📋 ESTRUCTURA TABLA PLANES_SUSCRIPCION' as titulo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion'
ORDER BY ordinal_position;

-- Verificar si hay datos existentes
SELECT 
    '�� DATOS EXISTENTES' as titulo,
    COUNT(*) as total_planes
FROM planes_suscripcion;

-- Mostrar algunos registros si existen
SELECT * FROM planes_suscripcion LIMIT 3;
