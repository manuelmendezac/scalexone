-- Agregar columnas faltantes si no existen
ALTER TABLE planes_suscripcion 
ADD COLUMN IF NOT EXISTS precio_mensual DECIMAL(10,2);

ALTER TABLE planes_suscripcion 
ADD COLUMN IF NOT EXISTS precio_anual DECIMAL(10,2);

ALTER TABLE planes_suscripcion 
ADD COLUMN IF NOT EXISTS caracteristicas JSONB DEFAULT '[]';

ALTER TABLE planes_suscripcion 
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

ALTER TABLE planes_suscripcion 
ADD COLUMN IF NOT EXISTS descripcion TEXT;

ALTER TABLE planes_suscripcion 
ADD COLUMN IF NOT EXISTS nombre VARCHAR(255);

-- Verificar estructura actualizada
SELECT 
    '✅ ESTRUCTURA CORREGIDA' as titulo,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'planes_suscripcion'
ORDER BY ordinal_position;
