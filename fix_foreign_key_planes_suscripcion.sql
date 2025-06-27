-- =====================================================
-- DIAGNÓSTICO Y CORRECCIÓN CLAVE FORÁNEA PLANES_SUSCRIPCION
-- =====================================================

-- 1. Verificar la estructura de la tabla planes_suscripcion
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion' 
  AND column_name = 'comunidad_id';

-- 2. Verificar las claves foráneas existentes
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'planes_suscripcion';

-- 3. Verificar si el UUID de ScaleXone existe en comunidades
SELECT id, nombre, slug 
FROM comunidades 
WHERE id = '8fb70d6e-3237-465e-8669-979461cf2bc1';

-- 4. Ver qué tipo de dato espera la clave foránea
SELECT 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'comunidades' 
  AND column_name = 'id';
