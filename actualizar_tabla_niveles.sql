-- Agregar columna de descripción si no existe
ALTER TABLE niveles_ventas ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Actualizar la columna descripción para los registros existentes
UPDATE niveles_ventas SET descripcion = 'Descripción pendiente' WHERE descripcion IS NULL; 