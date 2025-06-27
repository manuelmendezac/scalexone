-- Verificar qué comunidades existen realmente
SELECT 
    '🏢 COMUNIDADES EXISTENTES' as titulo,
    id,
    nombre,
    descripcion,
    created_at
FROM comunidades
ORDER BY created_at;

-- Verificar si ScaleXone existe con otro ID
SELECT 
    '🔍 BUSCAR SCALEXONE' as titulo,
    id,
    nombre,
    CASE 
        WHEN LOWER(nombre) LIKE '%scale%' THEN '✅ ENCONTRADA'
        ELSE '❌ NO COINCIDE'
    END as coincidencia
FROM comunidades
WHERE LOWER(nombre) LIKE '%scale%' OR LOWER(descripcion) LIKE '%scale%';

-- Si no existe, crear la comunidad ScaleXone
INSERT INTO comunidades (
    id,
    nombre,
    descripcion,
    configuracion,
    activa
) VALUES (
    '8fb70d6e-3237-465e-8669-979461cf2bc1',
    'ScaleXone',
    'Comunidad principal de ScaleXone para trading y crecimiento personal',
    '{"tema": "trading", "tipo": "premium"}',
    true
) ON CONFLICT (id) DO NOTHING;

-- Verificar que ahora existe
SELECT 
    '✅ COMUNIDAD SCALEXONE CONFIRMADA' as resultado,
    id,
    nombre
FROM comunidades 
WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1';
