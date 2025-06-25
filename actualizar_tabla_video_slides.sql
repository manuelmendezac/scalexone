-- Agregar columna is_visible con valor por defecto true
ALTER TABLE video_slides 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Agregar columna order y establecer valores iniciales basados en created_at
ALTER TABLE video_slides 
ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- Actualizar los valores de order basados en created_at
WITH numbered_rows AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM video_slides
)
UPDATE video_slides
SET "order" = numbered_rows.row_num
FROM numbered_rows
WHERE video_slides.id = numbered_rows.id; 