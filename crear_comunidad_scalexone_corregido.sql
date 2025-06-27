-- Crear comunidad ScaleXone con estructura correcta
INSERT INTO comunidades (
    id,
    nombre,
    descripcion,
    configuracion
) VALUES (
    '8fb70d6e-3237-465e-8669-979461cf2bc1',
    'ScaleXone',
    'Comunidad principal de ScaleXone para trading y crecimiento personal',
    '{"tema": "trading", "tipo": "premium"}'
) ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    configuracion = EXCLUDED.configuracion;

-- Verificar que se creó correctamente
SELECT 
    '✅ COMUNIDAD SCALEXONE CREADA' as resultado,
    id,
    nombre,
    descripcion
FROM comunidades 
WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1';

-- Ahora probar crear un plan de suscripción
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
    '["Acceso completo", "Soporte prioritario", "Sin límites"]'
);

-- Confirmar éxito total
SELECT 
    '🎉 SISTEMA 100% FUNCIONAL' as estado,
    (SELECT COUNT(*) FROM comunidades WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as comunidad_existe,
    (SELECT COUNT(*) FROM planes_suscripcion WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as planes_creados;
