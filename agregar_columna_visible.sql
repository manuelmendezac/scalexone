-- Agregar columna is_visible a la tabla video_slides
ALTER TABLE video_slides
ADD COLUMN is_visible BOOLEAN DEFAULT true;

-- Actualizar registros existentes
UPDATE video_slides
SET is_visible = true
WHERE is_visible IS NULL; 