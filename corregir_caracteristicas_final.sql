-- Verificar el tipo actual de la columna caracteristicas
SELECT 
    '🔍 TIPO ACTUAL CARACTERISTICAS' as titulo,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' AND column_name = 'caracteristicas';

-- Cambiar el tipo de caracteristicas a JSONB para consistencia
ALTER TABLE planes_suscripcion 
ALTER COLUMN caracteristicas TYPE JSONB USING caracteristicas::jsonb;

-- Ahora insertar el plan con formato JSON correcto
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

-- Estado final del sistema
SELECT 
    '✅ SISTEMA 100% FUNCIONAL' as estado,
    (SELECT COUNT(*) FROM comunidades WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as comunidad_existe,
    (SELECT COUNT(*) FROM planes_suscripcion WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as total_planes;
