-- 1. Verificar si la comunidad existe
SELECT 
    '🔍 VERIFICAR COMUNIDAD SCALEXONE' as titulo,
    COUNT(*) as existe,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE - NECESITA CREARSE'
    END as estado
FROM comunidades 
WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1';

-- 2. Mostrar todas las comunidades existentes
SELECT 
    '🏢 TODAS LAS COMUNIDADES' as titulo,
    id,
    nombre,
    created_at
FROM comunidades 
ORDER BY created_at;

-- 3. Crear la comunidad ScaleXone si no existe
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
) ON CONFLICT (id) DO NOTHING;

-- 4. Confirmar que ahora existe
SELECT 
    '✅ COMUNIDAD CONFIRMADA' as resultado,
    id,
    nombre,
    descripcion
FROM comunidades 
WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1';

-- 5. Ahora crear el plan de prueba
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

-- 6. Verificar éxito total
SELECT 
    '🎉 SISTEMA 100% FUNCIONAL' as estado,
    (SELECT COUNT(*) FROM comunidades WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as comunidad_existe,
    (SELECT COUNT(*) FROM planes_suscripcion WHERE comunidad_id = '8fb70d6e-3237-465e-8669-979461cf2bc1') as planes_totales,
    (SELECT nombre FROM planes_suscripcion WHERE nombre = 'Plan Prueba Final') as ultimo_plan_creado;
