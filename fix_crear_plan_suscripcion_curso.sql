-- Script para insertar manualmente un plan de curso de prueba
-- y verificar qué está fallando en la creación automática

-- Insertar plan de prueba para verificar formato correcto
INSERT INTO planes_suscripcion (
    comunidad_id,
    nombre,
    descripcion,
    precio,
    moneda,
    duracion_dias,
    caracteristicas,
    limites,
    configuracion,
    activo,
    orden
) VALUES (
    '8fb70d6e-3237-465e-8669-979461cf2bc1',
    'Plan: Curso de Prueba Manual',
    'Plan creado manualmente para probar funcionalidad',
    99.99,
    'USD',
    30,
    ARRAY['Característica 1', 'Característica 2', 'Acceso completo'],
    '{}'::JSONB,
    '{
        "tipo": "curso_suscripcion",
        "afiliacion": {
            "habilitada": true,
            "niveles": 3,
            "comision_nivel1": 30,
            "comision_nivel2": 20,
            "comision_nivel3": 10
        }
    }'::JSONB,
    true,
    0
);

-- Verificar que se insertó correctamente
SELECT 
    '✅ PLAN DE PRUEBA CREADO' as resultado,
    id,
    nombre,
    precio,
    configuracion
FROM planes_suscripcion 
WHERE nombre = 'Plan: Curso de Prueba Manual';
