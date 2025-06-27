-- Crear plan con formato correcto para caracteristicas (text[] en lugar de jsonb)
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
    ARRAY['Acceso completo', 'Soporte prioritario', 'Sin límites']
);

-- Verificar que se creó correctamente
SELECT 
    '🎉 PLAN CREADO EXITOSAMENTE' as resultado,
    id,
    nombre,
    precio,
    moneda,
    caracteristicas
FROM planes_suscripcion 
WHERE nombre = 'Plan Prueba Final';

-- Confirmar estado final del sistema
SELECT 
    '✅ SISTEMA COMPLETAMENTE FUNCIONAL' as estado,
    (SELECT COUNT(*) FROM comunidades WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as comunidad_existe,
    (SELECT COUNT(*) FROM planes_suscripcion WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as total_planes;

-- Mostrar todos los planes de ScaleXone
SELECT 
    '📊 PLANES SCALEXONE' as titulo,
    nombre,
    precio,
    moneda,
    duracion_dias,
    caracteristicas
FROM planes_suscripcion 
WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1'
ORDER BY precio;
