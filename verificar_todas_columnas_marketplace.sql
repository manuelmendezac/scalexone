-- 1. Verificar TODAS las columnas de servicios_marketplace
SELECT 
    '📋 SERVICIOS_MARKETPLACE - TODAS LAS COLUMNAS' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'servicios_marketplace'
ORDER BY ordinal_position;

-- 2. Verificar TODAS las columnas de cursos_marketplace
SELECT 
    '📋 CURSOS_MARKETPLACE - TODAS LAS COLUMNAS' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cursos_marketplace'
ORDER BY ordinal_position;

-- 3. Encontrar columnas que están en servicios_marketplace pero NO en cursos_marketplace
SELECT 
    '❌ COLUMNAS SOLO EN SERVICIOS' as info,
    column_name
FROM information_schema.columns 
WHERE table_name = 'servicios_marketplace'
AND column_name NOT IN (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'cursos_marketplace'
);

-- 4. Encontrar columnas que están en cursos_marketplace pero NO en servicios_marketplace
SELECT 
    '❌ COLUMNAS SOLO EN CURSOS' as info,
    column_name
FROM information_schema.columns 
WHERE table_name = 'cursos_marketplace'
AND column_name NOT IN (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'servicios_marketplace'
);

-- 5. Encontrar columnas COMUNES entre ambas tablas
SELECT 
    '✅ COLUMNAS COMUNES' as info,
    s.column_name,
    s.data_type as servicios_tipo,
    c.data_type as cursos_tipo,
    CASE 
        WHEN s.data_type = c.data_type THEN '✅ MISMO TIPO'
        ELSE '⚠️ TIPO DIFERENTE'
    END as compatibilidad
FROM information_schema.columns s
INNER JOIN information_schema.columns c 
    ON s.column_name = c.column_name
WHERE s.table_name = 'servicios_marketplace'
AND c.table_name = 'cursos_marketplace'
ORDER BY s.column_name;
