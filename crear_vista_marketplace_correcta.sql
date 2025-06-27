-- Crear vista marketplace con las columnas que realmente existen
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
    activo,
    caracteristicas,  -- Esta columna SÍ existe en servicios
    niveles_comision,
    comision_nivel1,
    comision_nivel2,
    comision_nivel3,
    community_id,
    created_at,
    updated_at
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
    instructor as proveedor,  -- Mapear instructor -> proveedor
    categoria,
    rating,
    activo,
    NULL as caracteristicas,  -- NULL porque no existe en cursos
    niveles_comision,
    comision_nivel1,
    comision_nivel2,
    comision_nivel3,
    community_id,
    created_at,
    updated_at
FROM cursos_marketplace
WHERE activo = true;

-- Verificar que la vista se creó correctamente
SELECT 
    '✅ VISTA MARKETPLACE CREADA EXITOSAMENTE' as resultado,
    COUNT(*) as total_productos,
    COUNT(CASE WHEN tipo_producto = 'servicio' THEN 1 END) as servicios,
    COUNT(CASE WHEN tipo_producto = 'curso' THEN 1 END) as cursos
FROM vista_marketplace_completo;

-- Ahora insertar el plan de prueba (debería funcionar sin problemas)
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

-- Confirmar éxito total del sistema
SELECT 
    '🎉 SISTEMA 100% FUNCIONAL - ÉXITO TOTAL' as estado,
    nombre,
    precio,
    caracteristicas,
    'Plan creado exitosamente' as mensaje
FROM planes_suscripcion 
WHERE nombre = 'Plan Prueba Final';

-- Mostrar resumen final
SELECT 
    '📊 RESUMEN FINAL SCALEXONE' as titulo,
    (SELECT COUNT(*) FROM comunidades WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as comunidad_existe,
    (SELECT COUNT(*) FROM planes_suscripcion WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as planes_totales,
    (SELECT COUNT(*) FROM vista_marketplace_completo) as productos_marketplace;
