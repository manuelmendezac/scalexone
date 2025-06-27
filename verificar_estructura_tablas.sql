-- =====================================================
-- VERIFICAR ESTRUCTURA DE TABLAS - DIAGNÓSTICO COMPLETO
-- =====================================================

-- 1. Verificar qué tablas existen relacionadas con suscripciones
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%suscripcion%'
ORDER BY table_name;

-- 2. Verificar estructura de tabla suscripciones (si existe)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'suscripciones'
ORDER BY ordinal_position;

-- 3. Verificar estructura de tabla planes_suscripcion (si existe)  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'planes_suscripcion'
ORDER BY ordinal_position;

-- 4. Verificar estructura de tabla usuarios
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'usuarios'
ORDER BY ordinal_position;

-- 5. Verificar datos existentes en suscripciones (si existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suscripciones') THEN
    RAISE NOTICE 'Tabla suscripciones existe. Verificando datos...';
    PERFORM * FROM suscripciones LIMIT 1;
  ELSE
    RAISE NOTICE 'Tabla suscripciones NO existe';
  END IF;
END $$;

-- 6. Verificar comunidades existentes
SELECT id, nombre, slug FROM comunidades ORDER BY created_at;
