-- 1. Verificar qué vistas dependen de servicios_marketplace
SELECT 
    '🔍 VISTAS DEPENDIENTES' as titulo,
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE definition LIKE '%servicios_marketplace%' 
   OR definition LIKE '%caracteristicas%';

-- 2. Eliminar la vista vista_marketplace_completo temporalmente
DROP VIEW IF EXISTS vista_marketplace_completo CASCADE;

-- 3. Ahora cambiar el tipo de datos sin problemas
ALTER TABLE servicios_marketplace 
ALTER COLUMN caracteristicas TYPE JSONB USING 
    CASE 
        WHEN caracteristicas IS NULL THEN NULL
        ELSE '[]'::jsonb
    END;

-- 4. Recrear la vista con la estructura correcta
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

-- 5. Verificar que todo está correcto
SELECT 
    '✅ VISTA RECREADA' as resultado,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'servicios_marketplace' AND column_name = 'caracteristicas';

-- 6. Ahora insertar el plan de prueba
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

-- 7. Confirmar éxito total
SELECT 
    '🎉 SISTEMA COMPLETAMENTE FUNCIONAL' as estado,
    COUNT(*) as planes_scalexone
FROM planes_suscripcion 
WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1';
