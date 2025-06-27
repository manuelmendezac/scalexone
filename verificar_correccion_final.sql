-- Verificar que la corrección se aplicó correctamente
SELECT 
    '🎉 ESTADO FINAL DEL SISTEMA' as titulo,
    (SELECT data_type FROM information_schema.columns WHERE table_name = 'planes_suscripcion' AND column_name = 'comunidad_id') as planes_tipo,
    (SELECT data_type FROM information_schema.columns WHERE table_name = 'suscripciones' AND column_name = 'comunidad_id') as suscripciones_tipo,
    (SELECT data_type FROM information_schema.columns WHERE table_name = 'comunidades' AND column_name = 'id') as comunidades_tipo,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'planes_suscripcion') as politicas_planes,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'suscripciones') as politicas_suscripciones;

-- Probar inserción de un plan de prueba
INSERT INTO planes_suscripcion (
    comunidad_id,
    nombre,
    descripcion,
    precio_mensual,
    precio_anual,
    caracteristicas,
    activo
) VALUES (
    '8fb70d6e-3237-465e-8669-979461cf2bc1',
    'Plan de Prueba Final',
    'Plan para verificar que todo funciona correctamente',
    29.99,
    299.99,
    '["Acceso completo", "Soporte 24/7", "Sin límites"]',
    true
);

-- Verificar que se insertó correctamente
SELECT 
    '✅ PLAN CREADO EXITOSAMENTE' as resultado,
    id,
    nombre,
    precio_mensual,
    comunidad_id
FROM planes_suscripcion 
WHERE nombre = 'Plan de Prueba Final';
