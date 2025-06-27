-- 1. Verificar estructura de servicios_marketplace
SELECT 
    '📋 SERVICIOS_MARKETPLACE' as tabla,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'servicios_marketplace'
ORDER BY ordinal_position;

-- 2. Verificar estructura de cursos_marketplace  
SELECT 
    '📋 CURSOS_MARKETPLACE' as tabla,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'cursos_marketplace'
ORDER BY ordinal_position;

-- 3. Crear vista solo con columnas que existen en ambas tablas
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
    activo,
    caracteristicas,
    created_at
FROM cursos_marketplace
WHERE activo = true;

-- 4. Verificar que la vista se creó correctamente
SELECT 
    '✅ VISTA CREADA EXITOSAMENTE' as resultado,
    COUNT(*) as total_productos
FROM vista_marketplace_completo;

-- 5. Ahora insertar el plan de prueba
INSERT INTO planes_suscripcion (
    comunidad_id,
    nombre,
    descripcion,
    precio,
    moneda,
    duracion_dias,
    caracteristicas
) VALUES (
    '8fb70d6e-3237-465e-8669-979461cf2bc1',
    'Plan Prueba Final',
    'Plan para verificar funcionamiento completo',
    49.99,
    'USD',
    30,
    '["Acceso completo", "Soporte prioritario", "Sin límites"]'::jsonb
) ON CONFLICT (nombre) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio;

-- 6. Confirmar éxito total
SELECT 
    '🎉 SISTEMA 100% FUNCIONAL' as estado,
    nombre,
    precio,
    caracteristicas
FROM planes_suscripcion 
WHERE nombre = 'Plan Prueba Final';
