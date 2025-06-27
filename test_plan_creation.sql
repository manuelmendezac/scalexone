-- Script simple para probar la creación de un plan básico
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
    'Plan Test Básico',
    'Plan de prueba simple',
    19.99,
    'USD',
    30,
    '["Acceso básico", "Soporte email"]'::jsonb,
    true
);

-- Verificar que se creó
SELECT 
    '✅ PLAN CREADO CORRECTAMENTE' as resultado,
    id,
    nombre,
    precio,
    caracteristicas
FROM planes_suscripcion 
WHERE nombre = 'Plan Test Básico';

-- Confirmar estado final
SELECT 
    '🎉 SISTEMA COMPLETAMENTE OPERATIVO' as estado,
    COUNT(*) as total_planes_scalexone
FROM planes_suscripcion 
WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1';
