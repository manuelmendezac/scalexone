-- Verificar estructura real de la tabla comunidades
SELECT 
    '📋 ESTRUCTURA TABLA COMUNIDADES' as titulo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'comunidades'
ORDER BY ordinal_position;

-- Ver qué comunidades existen actualmente
SELECT 
    '🏢 COMUNIDADES EXISTENTES' as titulo,
    *
FROM comunidades
LIMIT 5;
